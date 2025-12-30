-- ============================================
-- Amal Chat Platform - Optimized PostgreSQL Schema
-- Version: 2.0
-- Normalized to 3NF (Third Normal Form)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- ============================================
-- DOMAIN TYPES (for data integrity)
-- ============================================

CREATE DOMAIN email_address AS VARCHAR(255)
  CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN locale_code AS VARCHAR(10)
  CHECK (VALUE IN ('ar-DZ', 'fr-FR', 'en-US'));

CREATE DOMAIN timezone_name AS VARCHAR(50)
  CHECK (VALUE ~ '^[A-Za-z_]+/[A-Za-z_]+$');

-- ============================================
-- LOOKUP TABLES (Reference Data)
-- ============================================

-- Conversation modes
CREATE TABLE IF NOT EXISTS conversation_modes (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO conversation_modes (code, name_ar, name_fr, name_en, description) VALUES
  ('AUTO', 'تلقائي', 'Automatique', 'Automatic', 'AI decides between RAG and SUPPORT'),
  ('RAG', 'استرجاع معلومات', 'Récupération', 'Retrieval', 'Information retrieval mode'),
  ('SUPPORT', 'دعم متخصص', 'Support', 'Support', 'Human support ticket mode')
ON CONFLICT (code) DO NOTHING;

-- Conversation statuses
CREATE TABLE IF NOT EXISTS conversation_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  is_terminal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO conversation_statuses (code, name_ar, name_fr, name_en, is_terminal) VALUES
  ('active', 'نشط', 'Actif', 'Active', false),
  ('archived', 'مؤرشف', 'Archivé', 'Archived', true),
  ('escalated', 'تم التصعيد', 'Escaladé', 'Escalated', false),
  ('closed', 'مغلق', 'Fermé', 'Closed', true)
ON CONFLICT (code) DO NOTHING;

-- Support ticket categories
CREATE TABLE IF NOT EXISTS ticket_categories (
  code VARCHAR(50) PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO ticket_categories (code, name_ar, name_fr, name_en, icon, sort_order) VALUES
  ('addiction', 'الإدمان', 'Dépendance', 'Addiction', '💊', 1),
  ('mental_health', 'الصحة النفسية', 'Santé mentale', 'Mental Health', '🧠', 2),
  ('prevention', 'الوقاية', 'Prévention', 'Prevention', '🛡️', 3),
  ('resources', 'الموارد', 'Ressources', 'Resources', '📚', 4),
  ('crisis', 'أزمة', 'Crise', 'Crisis', '🆘', 0)
ON CONFLICT (code) DO NOTHING;

-- Support ticket priorities
CREATE TABLE IF NOT EXISTS ticket_priorities (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(50) NOT NULL,
  name_fr VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL UNIQUE,
  color VARCHAR(7),
  sla_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO ticket_priorities (code, name_ar, name_fr, name_en, level, color, sla_hours) VALUES
  ('low', 'منخفض', 'Bas', 'Low', 1, '#28a745', 72),
  ('medium', 'متوسط', 'Moyen', 'Medium', 2, '#ffc107', 24),
  ('high', 'عالي', 'Élevé', 'High', 3, '#fd7e14', 8),
  ('urgent', 'عاجل', 'Urgent', 'Urgent', 4, '#dc3545', 2)
ON CONFLICT (code) DO NOTHING;

-- Support ticket statuses
CREATE TABLE IF NOT EXISTS ticket_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(50) NOT NULL,
  name_fr VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  is_open BOOLEAN DEFAULT true,
  is_terminal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO ticket_statuses (code, name_ar, name_fr, name_en, is_open, is_terminal) VALUES
  ('open', 'مفتوح', 'Ouvert', 'Open', true, false),
  ('in_progress', 'قيد المعالجة', 'En cours', 'In Progress', true, false),
  ('pending', 'معلق', 'En attente', 'Pending', true, false),
  ('resolved', 'تم الحل', 'Résolu', 'Resolved', false, true),
  ('closed', 'مغلق', 'Fermé', 'Closed', false, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- CORE TABLES (Normalized to 3NF)
-- ============================================

-- Users table (1NF, 2NF, 3NF compliant)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email email_address UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  locale locale_code DEFAULT 'ar-DZ',
  timezone timezone_name DEFAULT 'Africa/Algiers',
  
  -- Consent tracking
  consent_data_storage BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  consent_ip_address INET,
  
  -- Account status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  
  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT chk_consent CHECK (
    (consent_data_storage = false) OR 
    (consent_data_storage = true AND consent_timestamp IS NOT NULL)
  )
);

-- User preferences (separate table for 3NF)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  language_preference locale_code DEFAULT 'ar-DZ',
  accessibility_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Magic links table
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email email_address NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_magic_link_expiry CHECK (expires_at > created_at),
  CONSTRAINT chk_magic_link_used CHECK (
    (used = false AND used_at IS NULL) OR 
    (used = true AND used_at IS NOT NULL)
  )
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  mode VARCHAR(20) NOT NULL DEFAULT 'AUTO' REFERENCES conversation_modes(code),
  status VARCHAR(20) NOT NULL DEFAULT 'active' REFERENCES conversation_statuses(code),
  
  -- Metadata
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  
  CONSTRAINT chk_message_count CHECK (message_count >= 0)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Metadata stored as JSONB for flexibility
  metadata JSONB DEFAULT '{}',
  
  -- Message tracking
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT chk_content_length CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 10000),
  CONSTRAINT chk_tokens CHECK (tokens_used IS NULL OR tokens_used > 0)
);

-- Decision logs (for AUTO mode)
CREATE TABLE IF NOT EXISTS decision_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('rag', 'support')),
  reason TEXT NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- LLM details
  model_used VARCHAR(100),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_reason_length CHECK (LENGTH(reason) > 0)
);

-- Documents table (for RAG)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64) UNIQUE, -- SHA-256 hash for deduplication
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  source VARCHAR(255),
  author VARCHAR(255),
  language locale_code,
  
  -- Processing status
  pii_stripped BOOLEAN DEFAULT false,
  review_status VARCHAR(20) DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'flagged')
  ),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Statistics
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT chk_content_not_empty CHECK (LENGTH(content) > 0),
  CONSTRAINT chk_chunk_count CHECK (chunk_count >= 0)
);

-- Document chunks (for RAG with pgvector)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimensions
  chunk_index INTEGER NOT NULL,
  
  -- Chunk metadata
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,
  start_position INTEGER,
  end_position INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_chunk_index CHECK (chunk_index >= 0),
  CONSTRAINT chk_positions CHECK (
    start_position IS NULL OR end_position IS NULL OR 
    end_position > start_position
  ),
  CONSTRAINT uq_document_chunk UNIQUE (document_id, chunk_index)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable ticket number
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ticket details
  subject VARCHAR(500) NOT NULL,
  category VARCHAR(50) NOT NULL REFERENCES ticket_categories(code),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' REFERENCES ticket_priorities(code),
  status VARCHAR(20) NOT NULL DEFAULT 'open' REFERENCES ticket_statuses(code),
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Escalation
  escalated BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  escalated_at TIMESTAMPTZ,
  escalated_by UUID REFERENCES users(id),
  
  -- SLA tracking
  sla_due_at TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  CONSTRAINT chk_escalation CHECK (
    (escalated = false) OR 
    (escalated = true AND escalation_reason IS NOT NULL AND escalated_at IS NOT NULL)
  ),
  CONSTRAINT chk_resolution CHECK (
    (resolved_at IS NULL) OR 
    (resolved_at IS NOT NULL AND resolved_by IS NOT NULL)
  )
);

-- Ticket comments (for ticket conversation history)
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs public comments
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT chk_comment_content CHECK (LENGTH(content) > 0)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  
  -- Request details
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  -- Response details
  status_code INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_action_not_empty CHECK (LENGTH(action) > 0)
);

-- User sessions (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  
  -- Session details
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  
  CONSTRAINT chk_session_expiry CHECK (expires_at > created_at)
);

-- ============================================
-- INDEXES (Optimized for Performance)
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Conversations indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id) WHERE archived_at IS NULL;
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_mode ON conversations(mode);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_role ON messages(role);

-- Full-text search on messages
CREATE INDEX idx_messages_content_fts ON messages USING gin(to_tsvector('arabic', content));

-- Decision logs indexes
CREATE INDEX idx_decision_logs_conversation_id ON decision_logs(conversation_id);
CREATE INDEX idx_decision_logs_decision ON decision_logs(decision);
CREATE INDEX idx_decision_logs_created_at ON decision_logs(created_at DESC);

-- Documents indexes
CREATE INDEX idx_documents_review_status ON documents(review_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_language ON documents(language);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_content_hash ON documents(content_hash) WHERE deleted_at IS NULL;

-- Document chunks indexes (pgvector)
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding_ivfflat ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Alternative: HNSW index (better for high-dimensional vectors, requires pg 16+)
-- CREATE INDEX idx_document_chunks_embedding_hnsw ON document_chunks 
--   USING hnsw (embedding vector_cosine_ops);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_sla_due ON support_tickets(sla_due_at) WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);

-- Ticket comments indexes
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at ASC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE revoked_at IS NULL;

-- Magic links indexes
CREATE INDEX idx_magic_links_email ON magic_links(email) WHERE used = false;
CREATE INDEX idx_magic_links_token ON magic_links(token) WHERE used = false;
CREATE INDEX idx_magic_links_expires_at ON magic_links(expires_at) WHERE used = false;

-- ============================================
-- TRIGGERS (Automated Updates)
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update conversation message count
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations 
    SET message_count = GREATEST(message_count - 1, 0)
    WHERE id = OLD.conversation_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_message_count
AFTER INSERT OR DELETE ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- Generate ticket number automatically
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_part VARCHAR(6);
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_part
  FROM support_tickets
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  NEW.ticket_number := 'TKT-' || year_part || '-' || sequence_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_number
BEFORE INSERT ON support_tickets
FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Calculate SLA due date
CREATE OR REPLACE FUNCTION calculate_sla_due_date()
RETURNS TRIGGER AS $$
DECLARE
  sla_hours INTEGER;
BEGIN
  SELECT tp.sla_hours INTO sla_hours
  FROM ticket_priorities tp
  WHERE tp.code = NEW.priority;
  
  IF sla_hours IS NOT NULL THEN
    NEW.sla_due_at := NEW.created_at + (sla_hours || ' hours')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_sla_due_date
BEFORE INSERT ON support_tickets
FOR EACH ROW EXECUTE FUNCTION calculate_sla_due_date();

-- ============================================
-- VIEWS (For Dashboard and Reporting)
-- ============================================

-- Active conversations view
CREATE OR REPLACE VIEW v_active_conversations AS
SELECT 
  c.id,
  c.user_id,
  u.email,
  u.name,
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

-- Ticket statistics view
CREATE OR REPLACE VIEW v_ticket_statistics AS
SELECT 
  category,
  priority,
  status,
  COUNT(*) as ticket_count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))/3600) as avg_resolution_hours,
  COUNT(CASE WHEN sla_breached THEN 1 END) as sla_breached_count
FROM support_tickets
GROUP BY category, priority, status;

-- User activity view
CREATE OR REPLACE VIEW v_user_activity AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.last_login_at,
  COUNT(DISTINCT c.id) as conversation_count,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT st.id) as ticket_count,
  MAX(c.updated_at) as last_conversation_at
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN messages m ON c.id = m.conversation_id AND m.role = 'user'
LEFT JOIN support_tickets st ON u.id = st.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.name, u.last_login_at;

-- Decision analytics view
CREATE OR REPLACE VIEW v_decision_analytics AS
SELECT 
  DATE_TRUNC('day', dl.created_at) as date,
  dl.decision,
  COUNT(*) as decision_count,
  AVG(dl.confidence) as avg_confidence,
  COUNT(DISTINCT dl.conversation_id) as unique_conversations
FROM decision_logs dl
GROUP BY DATE_TRUNC('day', dl.created_at), dl.decision
ORDER BY date DESC;

-- ============================================
-- FUNCTIONS (Utility Functions)
-- ============================================

-- Function to archive old conversations
CREATE OR REPLACE FUNCTION archive_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE conversations
  SET archived_at = NOW(),
      status = 'archived'
  WHERE last_message_at < NOW() - (days_old || ' days')::INTERVAL
    AND archived_at IS NULL
    AND status = 'active';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired magic links
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

-- Function to get conversation summary
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
  LEFT JOIN messages m ON c.id = m.conversation_id
  WHERE c.id = conv_id
  GROUP BY c.id, u.email, c.mode, c.status, c.created_at, c.last_message_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MATERIALIZED VIEWS (For Performance)
-- ============================================

-- Daily statistics materialized view
CREATE MATERIALIZED VIEW mv_daily_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  'users' as metric_type,
  COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as date,
  'conversations' as metric_type,
  COUNT(*) as count
FROM conversations
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as date,
  'messages' as metric_type,
  COUNT(*) as count
FROM messages
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as date,
  'tickets' as metric_type,
  COUNT(*) as count
FROM support_tickets
GROUP BY DATE_TRUNC('day', created_at);

CREATE UNIQUE INDEX idx_mv_daily_statistics ON mv_daily_statistics(date, metric_type);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_daily_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_statistics;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTITIONING (For Large Tables)
-- ============================================

-- Partition audit_logs by month (for better performance with large datasets)
-- Note: This is optional and should be implemented if audit logs grow very large

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON TABLE conversations IS 'Chat conversations between users and the AI assistant';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE decision_logs IS 'AUTO mode decision logs for analytics and debugging';
COMMENT ON TABLE documents IS 'Documents indexed for RAG (Retrieval-Augmented Generation)';
COMMENT ON TABLE document_chunks IS 'Chunked documents with vector embeddings for semantic search';
COMMENT ON TABLE support_tickets IS 'Support tickets for human intervention';
COMMENT ON TABLE audit_logs IS 'System audit trail for security and compliance';

COMMENT ON COLUMN users.consent_data_storage IS 'User consent for data storage (GDPR compliance)';
COMMENT ON COLUMN documents.content_hash IS 'SHA-256 hash for document deduplication';
COMMENT ON COLUMN document_chunks.embedding IS 'Vector embedding (1536 dimensions) for semantic search';
COMMENT ON COLUMN support_tickets.ticket_number IS 'Human-readable ticket number (e.g., TKT-2025-000001)';
COMMENT ON COLUMN support_tickets.sla_due_at IS 'SLA deadline based on priority';

-- ============================================
-- GRANTS (Security)
-- ============================================

-- Create application role
-- CREATE ROLE amal_app WITH LOGIN PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE amal_chat TO amal_app;
-- GRANT USAGE ON SCHEMA public TO amal_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO amal_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO amal_app;

-- ============================================
-- END OF SCHEMA
-- ============================================
