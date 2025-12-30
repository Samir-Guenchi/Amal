-- ============================================
-- Reporting Views
-- ============================================
-- Purpose: Pre-built views for dashboards and analytics
-- Dependencies: 03-core-tables.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- ============================================
-- CONVERSATION VIEWS
-- ============================================

-- Active conversations with user details
CREATE OR REPLACE VIEW v_active_conversations AS
SELECT 
  c.id,
  c.user_id,
  u.email,
  u.name,
  u.locale,
  c.title,
  c.mode,
  c.status,
  c.message_count,
  c.last_message_at,
  c.created_at,
  c.updated_at
FROM conversations c
JOIN users u ON c.user_id = u.id
WHERE c.archived_at IS NULL
  AND u.deleted_at IS NULL;

COMMENT ON VIEW v_active_conversations IS 'Active conversations with user information';

-- Conversation timeline (recent activity)
CREATE OR REPLACE VIEW v_conversation_timeline AS
SELECT 
  c.id as conversation_id,
  c.user_id,
  u.email,
  u.name,
  c.title,
  c.mode,
  c.status,
  c.message_count,
  c.last_message_at,
  c.created_at,
  EXTRACT(EPOCH FROM (NOW() - c.last_message_at))/3600 as hours_since_last_message
FROM conversations c
JOIN users u ON c.user_id = u.id
WHERE c.archived_at IS NULL
  AND u.deleted_at IS NULL
ORDER BY c.last_message_at DESC;

COMMENT ON VIEW v_conversation_timeline IS 'Conversations ordered by recent activity';

-- ============================================
-- SUPPORT TICKET VIEWS
-- ============================================

-- Active tickets with full details
CREATE OR REPLACE VIEW v_active_tickets AS
SELECT 
  st.id,
  st.ticket_number,
  st.user_id,
  u.email as user_email,
  u.name as user_name,
  st.subject,
  tc.name_ar as category_ar,
  tc.name_fr as category_fr,
  tc.name_en as category_en,
  tp.name_ar as priority_ar,
  tp.name_fr as priority_fr,
  tp.name_en as priority_en,
  tp.level as priority_level,
  ts.name_ar as status_ar,
  ts.name_fr as status_fr,
  ts.name_en as status_en,
  st.assigned_to,
  assigned_user.name as assigned_to_name,
  st.escalated,
  st.sla_due_at,
  st.sla_breached,
  EXTRACT(EPOCH FROM (NOW() - st.created_at))/3600 as age_hours,
  CASE 
    WHEN st.sla_due_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (st.sla_due_at - NOW()))/3600
    ELSE NULL
  END as hours_until_sla_breach,
  st.created_at,
  st.updated_at
FROM support_tickets st
JOIN users u ON st.user_id = u.id
JOIN ticket_categories tc ON st.category = tc.code
JOIN ticket_priorities tp ON st.priority = tp.code
JOIN ticket_statuses ts ON st.status = ts.code
LEFT JOIN users assigned_user ON st.assigned_to = assigned_user.id
WHERE st.status IN ('open', 'in_progress', 'pending')
ORDER BY tp.level DESC, st.created_at ASC;

COMMENT ON VIEW v_active_tickets IS 'All active tickets with multilingual labels';

-- Tickets approaching SLA breach
CREATE OR REPLACE VIEW v_tickets_at_risk AS
SELECT 
  st.id,
  st.ticket_number,
  st.subject,
  st.priority,
  st.category,
  st.assigned_to,
  st.sla_due_at,
  EXTRACT(EPOCH FROM (st.sla_due_at - NOW()))/3600 as hours_remaining,
  st.created_at
FROM support_tickets st
WHERE st.status IN ('open', 'in_progress', 'pending')
  AND st.sla_due_at IS NOT NULL
  AND st.sla_breached = false
  AND st.sla_due_at < NOW() + INTERVAL '4 hours'
ORDER BY st.sla_due_at ASC;

COMMENT ON VIEW v_tickets_at_risk IS 'Tickets approaching SLA deadline (< 4 hours)';

-- ============================================
-- STATISTICS VIEWS
-- ============================================

-- Ticket statistics by category
CREATE OR REPLACE VIEW v_ticket_statistics AS
SELECT 
  st.category,
  tc.name_ar as category_name_ar,
  tc.name_fr as category_name_fr,
  tc.name_en as category_name_en,
  st.priority,
  st.status,
  COUNT(*) as ticket_count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(st.resolved_at, NOW()) - st.created_at))/3600) as avg_resolution_hours,
  COUNT(CASE WHEN st.sla_breached THEN 1 END) as sla_breached_count,
  ROUND(
    (COUNT(CASE WHEN st.sla_breached THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100),
    2
  ) as sla_breach_percentage
FROM support_tickets st
JOIN ticket_categories tc ON st.category = tc.code
GROUP BY st.category, tc.name_ar, tc.name_fr, tc.name_en, st.priority, st.status;

COMMENT ON VIEW v_ticket_statistics IS 'Ticket metrics grouped by category, priority, and status';

-- User activity summary
CREATE OR REPLACE VIEW v_user_activity AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.locale,
  u.is_active,
  u.last_login_at,
  COUNT(DISTINCT c.id) as conversation_count,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT st.id) as ticket_count,
  MAX(c.updated_at) as last_conversation_at,
  MAX(st.updated_at) as last_ticket_at,
  u.created_at as account_created_at,
  EXTRACT(DAY FROM NOW() - u.created_at) as account_age_days
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN messages m ON c.id = m.conversation_id AND m.role = 'user' AND m.deleted_at IS NULL
LEFT JOIN support_tickets st ON u.id = st.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.name, u.locale, u.is_active, u.last_login_at, u.created_at;

COMMENT ON VIEW v_user_activity IS 'User engagement metrics';

-- Decision analytics (AUTO mode performance)
CREATE OR REPLACE VIEW v_decision_analytics AS
SELECT 
  DATE_TRUNC('day', dl.created_at) as date,
  dl.decision,
  COUNT(*) as decision_count,
  AVG(dl.confidence) as avg_confidence,
  MIN(dl.confidence) as min_confidence,
  MAX(dl.confidence) as max_confidence,
  COUNT(DISTINCT dl.conversation_id) as unique_conversations,
  AVG(dl.prompt_tokens + dl.completion_tokens) as avg_total_tokens
FROM decision_logs dl
GROUP BY DATE_TRUNC('day', dl.created_at), dl.decision
ORDER BY date DESC, dl.decision;

COMMENT ON VIEW v_decision_analytics IS 'AUTO mode decision metrics by day';

-- ============================================
-- MATERIALIZED VIEWS (for performance)
-- ============================================

-- Daily statistics (refreshed periodically)
CREATE MATERIALIZED VIEW mv_daily_statistics AS
SELECT 
  DATE_TRUNC('day', created_at)::DATE as date,
  'users' as metric_type,
  COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at)::DATE as date,
  'conversations' as metric_type,
  COUNT(*) as count
FROM conversations
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at)::DATE as date,
  'messages' as metric_type,
  COUNT(*) as count
FROM messages
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at)::DATE as date,
  'tickets' as metric_type,
  COUNT(*) as count
FROM support_tickets
GROUP BY DATE_TRUNC('day', created_at)

ORDER BY date DESC, metric_type;

CREATE UNIQUE INDEX idx_mv_daily_statistics ON mv_daily_statistics(date, metric_type);

COMMENT ON MATERIALIZED VIEW mv_daily_statistics IS 'Daily metrics (refresh with refresh_daily_statistics())';

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_statistics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_daily_statistics() IS 'Refresh daily statistics materialized view';

-- ============================================
-- ADMIN VIEWS
-- ============================================

-- System health overview
CREATE OR REPLACE VIEW v_system_health AS
SELECT 
  'total_users' as metric,
  COUNT(*)::TEXT as value
FROM users WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'active_users_7d' as metric,
  COUNT(*)::TEXT as value
FROM users 
WHERE last_login_at > NOW() - INTERVAL '7 days' 
  AND deleted_at IS NULL

UNION ALL

SELECT 
  'active_conversations' as metric,
  COUNT(*)::TEXT as value
FROM conversations 
WHERE archived_at IS NULL

UNION ALL

SELECT 
  'open_tickets' as metric,
  COUNT(*)::TEXT as value
FROM support_tickets 
WHERE status IN ('open', 'in_progress', 'pending')

UNION ALL

SELECT 
  'sla_breached_tickets' as metric,
  COUNT(*)::TEXT as value
FROM support_tickets 
WHERE sla_breached = true 
  AND status IN ('open', 'in_progress', 'pending')

UNION ALL

SELECT 
  'messages_today' as metric,
  COUNT(*)::TEXT as value
FROM messages 
WHERE created_at > CURRENT_DATE 
  AND deleted_at IS NULL;

COMMENT ON VIEW v_system_health IS 'Key system metrics for admin dashboard';

-- ============================================
-- END OF VIEWS
-- ============================================
