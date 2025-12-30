-- ============================================
-- Core Tables
-- ============================================
-- Purpose: Main application tables (No RAG - uses external API)
-- Dependencies: 00-extensions.sql, 01-domains.sql, 02-lookup-tables.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email email_address UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  locale locale_code DEFAULT 'ar-DZ',
  timezone timezone_name DEFAULT 'Africa/Algiers',
  phone phone_number_dz,
  
  -- Consent tracking (GDPR compliance)
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
  ),
  CONSTRAINT chk_failed_attempts CHECK (failed_login_attempts >= 0)
);

COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON COLUMN users.consent_data_storage IS 'GDPR consent for data storage';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for security lockout';

-- User preferences (3NF separation)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  language_preference locale_code DEFAULT 'ar-DZ',
  accessibility_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_preferences IS 'User UI preferences (normalized from users table)';

-- Magic links for passwordless authentication
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

COMMENT ON TABLE magic_links IS 'Passwordless authentication tokens';

-- User sessions
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

COMMENT ON TABLE user_sessions IS 'Active user sessions with refresh tokens';

-- ============================================
-- CONVERSATION SYSTEM
-- ============================================

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  mode VARCHAR(20) NOT NULL DEFAULT 'AUTO' REFERENCES conversation_modes(code),
  status VARCHAR(20) NOT NULL DEFAULT 'active' REFERENCES conversation_statuses(code),
  
  -- Metadata (denormalized for performance)
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  
  CONSTRAINT chk_message_count CHECK (message_count >= 0)
);

COMMENT ON TABLE conversations IS 'Chat conversations between users and AI assistant';
COMMENT ON COLUMN conversations.message_count IS 'Cached count (updated by trigger)';

-- Messages
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

COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN messages.metadata IS 'Flexible storage for message-specific data';

-- Decision logs (for AUTO mode)
CREATE TABLE IF NOT EXISTS decision_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('rag_api', 'support')),
  reason TEXT NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- LLM details
  model_used VARCHAR(100),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  -- External RAG API details (if applicable)
  rag_api_endpoint VARCHAR(500),
  rag_api_response_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_reason_length CHECK (LENGTH(reason) > 0)
);

COMMENT ON TABLE decision_logs IS 'AUTO mode decision logs for analytics';
COMMENT ON COLUMN decision_logs.decision IS 'rag_api: External RAG API call, support: Create ticket';
COMMENT ON COLUMN decision_logs.rag_api_endpoint IS 'External RAG API endpoint used';

-- ============================================
-- SUPPORT TICKET SYSTEM
-- ============================================

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable (e.g., TKT-2025-000001)
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
  
  CONSTRAINT chk_subject_length CHECK (LENGTH(subject) > 0),
  CONSTRAINT chk_escalation CHECK (
    (escalated = false) OR 
    (escalated = true AND escalation_reason IS NOT NULL AND escalated_at IS NOT NULL)
  ),
  CONSTRAINT chk_resolution CHECK (
    (resolved_at IS NULL) OR 
    (resolved_at IS NOT NULL AND resolved_by IS NOT NULL)
  ),
  CONSTRAINT chk_assignment CHECK (
    (assigned_to IS NULL AND assigned_at IS NULL) OR
    (assigned_to IS NOT NULL AND assigned_at IS NOT NULL)
  )
);

COMMENT ON TABLE support_tickets IS 'Support tickets for human intervention';
COMMENT ON COLUMN support_tickets.ticket_number IS 'Human-readable ticket number (auto-generated)';
COMMENT ON COLUMN support_tickets.sla_due_at IS 'SLA deadline calculated from priority';
COMMENT ON COLUMN support_tickets.sla_breached IS 'True if ticket exceeded SLA deadline';

-- Ticket comments (conversation history)
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs public comments
  
  -- Attachments metadata (files stored externally)
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT chk_comment_content CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000)
);

COMMENT ON TABLE ticket_comments IS 'Comments and notes on support tickets';
COMMENT ON COLUMN ticket_comments.is_internal IS 'True for internal staff notes, false for public comments';
COMMENT ON COLUMN ticket_comments.attachments IS 'Array of attachment metadata (URLs, filenames, sizes)';

-- ============================================
-- AUDIT AND SECURITY
-- ============================================

-- Audit logs
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
  
  CONSTRAINT chk_action_not_empty CHECK (LENGTH(action) > 0),
  CONSTRAINT chk_status_code CHECK (status_code IS NULL OR (status_code >= 100 AND status_code < 600))
);

COMMENT ON TABLE audit_logs IS 'System audit trail for security and compliance';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., user.login, ticket.create)';
COMMENT ON COLUMN audit_logs.details IS 'Additional context as JSON';

-- ============================================
-- END OF CORE TABLES
-- ============================================
