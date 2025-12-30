-- ============================================
-- Utility Functions
-- ============================================
-- Purpose: Reusable database functions
-- Dependencies: 03-core-tables.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- ============================================
-- MAINTENANCE FUNCTIONS
-- ============================================

-- Archive old conversations
CREATE OR REPLACE FUNCTION archive_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE conversations
  SET archived_at = NOW(),
      status = 'archived',
      updated_at = NOW()
  WHERE last_message_at < NOW() - (days_old || ' days')::INTERVAL
    AND archived_at IS NULL
    AND status = 'active';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_conversations(INTEGER) IS 'Archive inactive conversations older than specified days';

-- Clean up expired magic links
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM magic_links
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_magic_links() IS 'Remove expired magic links older than 7 days';

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Remove expired sessions older than 30 days';

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get conversation summary
CREATE OR REPLACE FUNCTION get_conversation_summary(conv_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  user_email VARCHAR,
  mode VARCHAR,
  status VARCHAR,
  message_count BIGINT,
  user_messages BIGINT,
  assistant_messages BIGINT,
  avg_response_time_seconds NUMERIC,
  created_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    u.email,
    c.mode,
    c.status,
    COUNT(m.id),
    COUNT(CASE WHEN m.role = 'user' THEN 1 END),
    COUNT(CASE WHEN m.role = 'assistant' THEN 1 END),
    AVG(m.processing_time_ms / 1000.0),
    c.created_at,
    c.last_message_at
  FROM conversations c
  JOIN users u ON c.user_id = u.id
  LEFT JOIN messages m ON c.id = m.conversation_id AND m.deleted_at IS NULL
  WHERE c.id = conv_id
  GROUP BY c.id, u.email, c.mode, c.status, c.created_at, c.last_message_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_conversation_summary(UUID) IS 'Get detailed conversation statistics';


-- Get ticket statistics by category
CREATE OR REPLACE FUNCTION get_ticket_statistics_by_category(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  category VARCHAR,
  total_tickets BIGINT,
  open_tickets BIGINT,
  resolved_tickets BIGINT,
  avg_resolution_hours NUMERIC,
  sla_breach_count BIGINT,
  sla_breach_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.category,
    COUNT(*),
    COUNT(CASE WHEN st.status IN ('open', 'in_progress', 'pending') THEN 1 END),
    COUNT(CASE WHEN st.status = 'resolved' THEN 1 END),
    AVG(EXTRACT(EPOCH FROM (COALESCE(st.resolved_at, NOW()) - st.created_at))/3600),
    COUNT(CASE WHEN st.sla_breached THEN 1 END),
    ROUND((COUNT(CASE WHEN st.sla_breached THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
  FROM support_tickets st
  WHERE st.created_at BETWEEN start_date AND end_date
  GROUP BY st.category;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_ticket_statistics_by_category(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Ticket analytics by category';

-- Get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  name VARCHAR,
  total_conversations BIGINT,
  total_messages BIGINT,
  total_tickets BIGINT,
  last_activity TIMESTAMPTZ,
  account_age_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    COUNT(DISTINCT c.id),
    COUNT(DISTINCT m.id),
    COUNT(DISTINCT st.id),
    GREATEST(
      u.last_login_at,
      MAX(c.updated_at),
      MAX(st.updated_at)
    ),
    EXTRACT(DAY FROM NOW() - u.created_at)::INTEGER
  FROM users u
  LEFT JOIN conversations c ON u.id = c.user_id
  LEFT JOIN messages m ON c.id = m.conversation_id AND m.role = 'user'
  LEFT JOIN support_tickets st ON u.id = st.user_id
  WHERE u.id = target_user_id
  GROUP BY u.id, u.email, u.name, u.last_login_at, u.created_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_activity_summary(UUID) IS 'Comprehensive user activity report';

-- ============================================
-- SEARCH FUNCTIONS
-- ============================================

-- Search messages with full-text search
CREATE OR REPLACE FUNCTION search_messages(
  search_query TEXT,
  search_language VARCHAR DEFAULT 'arabic',
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
DECLARE
  ts_config REGCONFIG;
BEGIN
  -- Map language to PostgreSQL text search configuration
  ts_config := CASE search_language
    WHEN 'arabic' THEN 'arabic'::regconfig
    WHEN 'french' THEN 'french'::regconfig
    WHEN 'english' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;
  
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.content,
    m.created_at,
    ts_rank(to_tsvector(ts_config, m.content), plainto_tsquery(ts_config, search_query))
  FROM messages m
  WHERE to_tsvector(ts_config, m.content) @@ plainto_tsquery(ts_config, search_query)
    AND m.deleted_at IS NULL
  ORDER BY ts_rank(to_tsvector(ts_config, m.content), plainto_tsquery(ts_config, search_query)) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_messages(TEXT, VARCHAR, INTEGER) IS 'Full-text search across messages';

-- ============================================
-- REPORTING FUNCTIONS
-- ============================================

-- Get daily statistics for date range
CREATE OR REPLACE FUNCTION get_daily_statistics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  new_users INTEGER,
  new_conversations INTEGER,
  new_messages INTEGER,
  new_tickets INTEGER,
  resolved_tickets INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::DATE as d
  )
  SELECT 
    ds.d,
    COALESCE(COUNT(DISTINCT u.id), 0)::INTEGER,
    COALESCE(COUNT(DISTINCT c.id), 0)::INTEGER,
    COALESCE(COUNT(DISTINCT m.id), 0)::INTEGER,
    COALESCE(COUNT(DISTINCT st.id), 0)::INTEGER,
    COALESCE(COUNT(DISTINCT CASE WHEN st.status = 'resolved' THEN st.id END), 0)::INTEGER
  FROM date_series ds
  LEFT JOIN users u ON DATE(u.created_at) = ds.d AND u.deleted_at IS NULL
  LEFT JOIN conversations c ON DATE(c.created_at) = ds.d
  LEFT JOIN messages m ON DATE(m.created_at) = ds.d AND m.deleted_at IS NULL
  LEFT JOIN support_tickets st ON DATE(st.created_at) = ds.d
  GROUP BY ds.d
  ORDER BY ds.d;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_daily_statistics(DATE, DATE) IS 'Daily metrics for dashboard';

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Check if user has active sessions
CREATE OR REPLACE FUNCTION has_active_sessions(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  session_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM user_sessions
  WHERE user_id = target_user_id
    AND expires_at > NOW()
    AND revoked_at IS NULL;
  
  RETURN session_count > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_active_sessions(UUID) IS 'Check if user has any active sessions';

-- Get ticket age in hours
CREATE OR REPLACE FUNCTION get_ticket_age_hours(ticket_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  age_hours NUMERIC;
BEGIN
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at))/3600 INTO age_hours
  FROM support_tickets
  WHERE id = ticket_id;
  
  RETURN COALESCE(age_hours, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_ticket_age_hours(UUID) IS 'Calculate ticket age in hours';

-- ============================================
-- SECURITY FUNCTIONS
-- ============================================

-- Audit user action
CREATE OR REPLACE FUNCTION audit_user_action(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status_code INTEGER DEFAULT 200
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    status_code
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_status_code
  )
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_user_action IS 'Create audit log entry';

-- ============================================
-- END OF FUNCTIONS
-- ============================================
