-- ============================================
-- Performance Indexes
-- ============================================
-- Purpose: Optimized indexes for query performance
-- Dependencies: 03-core-tables.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- ============================================
-- USER MANAGEMENT INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_verified ON users(is_verified) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_locale ON users(locale);

COMMENT ON INDEX idx_users_email IS 'Fast email lookup for authentication';
COMMENT ON INDEX idx_users_active IS 'Filter active users';

-- User sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at DESC);

COMMENT ON INDEX idx_user_sessions_expires_at IS 'Cleanup expired sessions';

-- Magic links
CREATE INDEX idx_magic_links_email ON magic_links(email) WHERE used = false;
CREATE INDEX idx_magic_links_token ON magic_links(token) WHERE used = false;
CREATE INDEX idx_magic_links_expires_at ON magic_links(expires_at) WHERE used = false;

COMMENT ON INDEX idx_magic_links_token IS 'Fast token validation';

-- ============================================
-- CONVERSATION INDEXES
-- ============================================

-- Conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id) WHERE archived_at IS NULL;
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_mode ON conversations(mode);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC) WHERE archived_at IS NULL;

COMMENT ON INDEX idx_conversations_user_updated IS 'User conversation timeline';

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_role ON messages(role);

-- Full-text search on messages (Arabic, French, English)
CREATE INDEX idx_messages_content_fts_ar ON messages USING gin(to_tsvector('arabic', content));
CREATE INDEX idx_messages_content_fts_fr ON messages USING gin(to_tsvector('french', content));
CREATE INDEX idx_messages_content_fts_en ON messages USING gin(to_tsvector('english', content));

-- Trigram index for fuzzy search
CREATE INDEX idx_messages_content_trgm ON messages USING gin(content gin_trgm_ops);

COMMENT ON INDEX idx_messages_content_fts_ar IS 'Full-text search for Arabic content';
COMMENT ON INDEX idx_messages_content_trgm IS 'Fuzzy text search using trigrams';

-- Decision logs
CREATE INDEX idx_decision_logs_conversation_id ON decision_logs(conversation_id);
CREATE INDEX idx_decision_logs_message_id ON decision_logs(message_id);
CREATE INDEX idx_decision_logs_decision ON decision_logs(decision);
CREATE INDEX idx_decision_logs_created_at ON decision_logs(created_at DESC);
CREATE INDEX idx_decision_logs_confidence ON decision_logs(confidence DESC);

COMMENT ON INDEX idx_decision_logs_decision IS 'Analytics on decision types';

-- ============================================
-- SUPPORT TICKET INDEXES
-- ============================================

-- Support tickets
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_updated_at ON support_tickets(updated_at DESC);
CREATE INDEX idx_support_tickets_sla_due ON support_tickets(sla_due_at) 
  WHERE status IN ('open', 'in_progress') AND sla_breached = false;
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_escalated ON support_tickets(escalated) WHERE escalated = true;

-- Composite indexes for common queries
CREATE INDEX idx_support_tickets_status_priority ON support_tickets(status, priority);
CREATE INDEX idx_support_tickets_assigned_status ON support_tickets(assigned_to, status) 
  WHERE assigned_to IS NOT NULL;

COMMENT ON INDEX idx_support_tickets_sla_due IS 'Monitor tickets approaching SLA deadline';
COMMENT ON INDEX idx_support_tickets_status_priority IS 'Dashboard filtering';

-- Ticket comments
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at ASC);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX idx_ticket_comments_internal ON ticket_comments(is_internal);

COMMENT ON INDEX idx_ticket_comments_ticket_id IS 'Load ticket conversation history';

-- ============================================
-- AUDIT LOG INDEXES
-- ============================================

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Composite index for common audit queries
CREATE INDEX idx_audit_logs_user_action_date ON audit_logs(user_id, action, created_at DESC);

COMMENT ON INDEX idx_audit_logs_user_action_date IS 'User activity timeline';

-- ============================================
-- LOOKUP TABLE INDEXES
-- ============================================

-- Lookup tables (minimal indexing needed as they're small)
CREATE INDEX idx_conversation_modes_active ON conversation_modes(is_active) WHERE is_active = true;
CREATE INDEX idx_ticket_categories_active ON ticket_categories(is_active) WHERE is_active = true;
CREATE INDEX idx_ticket_categories_sort ON ticket_categories(sort_order);

-- ============================================
-- JSONB INDEXES (for metadata queries)
-- ============================================

-- Message metadata
CREATE INDEX idx_messages_metadata_gin ON messages USING gin(metadata);

-- Ticket comment attachments
CREATE INDEX idx_ticket_comments_attachments_gin ON ticket_comments USING gin(attachments);

-- Audit log details
CREATE INDEX idx_audit_logs_details_gin ON audit_logs USING gin(details);

COMMENT ON INDEX idx_messages_metadata_gin IS 'Query message metadata fields';

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- Index Maintenance:
-- 1. Run ANALYZE after bulk inserts
-- 2. REINDEX CONCURRENTLY for production
-- 3. Monitor index bloat with pg_stat_user_indexes
-- 4. Consider partial indexes for large tables

-- Query Optimization:
-- 1. Use EXPLAIN ANALYZE to verify index usage
-- 2. Monitor slow queries with pg_stat_statements
-- 3. Adjust work_mem for complex queries
-- 4. Use connection pooling (PgBouncer)

-- ============================================
-- END OF INDEXES
-- ============================================
