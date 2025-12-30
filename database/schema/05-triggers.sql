-- ============================================
-- Automated Triggers
-- ============================================
-- Purpose: Automated data updates and business logic
-- Dependencies: 03-core-tables.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- ============================================
-- TIMESTAMP TRIGGERS
-- ============================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at timestamp';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at 
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at 
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONVERSATION TRIGGERS
-- ============================================

-- Update conversation message count and last message timestamp
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations 
    SET message_count = GREATEST(message_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_conversation_message_count() IS 'Maintain message count cache in conversations table';

CREATE TRIGGER trigger_update_conversation_message_count
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- ============================================
-- SUPPORT TICKET TRIGGERS
-- ============================================

-- Generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_part VARCHAR(6);
  ticket_count INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get count of tickets created this year
  SELECT COUNT(*) INTO ticket_count
  FROM support_tickets
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Generate padded sequence number
  sequence_part := LPAD((ticket_count + 1)::TEXT, 6, '0');
  
  -- Format: TKT-YYYY-NNNNNN
  NEW.ticket_number := 'TKT-' || year_part || '-' || sequence_part;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_ticket_number() IS 'Auto-generate human-readable ticket numbers';

CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Calculate SLA due date based on priority
CREATE OR REPLACE FUNCTION calculate_sla_due_date()
RETURNS TRIGGER AS $$
DECLARE
  sla_hours INTEGER;
BEGIN
  -- Get SLA hours from priority
  SELECT tp.sla_hours INTO sla_hours
  FROM ticket_priorities tp
  WHERE tp.code = NEW.priority;
  
  -- Calculate due date
  IF sla_hours IS NOT NULL THEN
    NEW.sla_due_at := NEW.created_at + (sla_hours || ' hours')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_sla_due_date() IS 'Calculate SLA deadline from ticket priority';

CREATE TRIGGER trigger_calculate_sla_due_date
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION calculate_sla_due_date();

-- Update SLA breach status
CREATE OR REPLACE FUNCTION check_sla_breach()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if ticket has breached SLA
  IF NEW.sla_due_at IS NOT NULL AND 
     NOW() > NEW.sla_due_at AND 
     NEW.status IN ('open', 'in_progress', 'pending') THEN
    NEW.sla_breached := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_sla_breach() IS 'Mark tickets that breach SLA deadline';

CREATE TRIGGER trigger_check_sla_breach
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION check_sla_breach();

-- Set resolved timestamp when status changes to resolved
CREATE OR REPLACE FUNCTION set_ticket_resolved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to resolved and resolved_at is not set
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := NOW();
  END IF;
  
  -- If status changed to closed and closed_at is not set
  IF NEW.status = 'closed' AND OLD.status != 'closed' AND NEW.closed_at IS NULL THEN
    NEW.closed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_ticket_resolved_timestamp() IS 'Auto-set resolution timestamps';

CREATE TRIGGER trigger_set_ticket_resolved_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_ticket_resolved_timestamp();

-- ============================================
-- SECURITY TRIGGERS
-- ============================================

-- Prevent modification of audit logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prevent_audit_log_modification() IS 'Audit logs are immutable';

CREATE TRIGGER trigger_prevent_audit_log_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER trigger_prevent_audit_log_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
  -- If last_login_at was updated (successful login)
  IF NEW.last_login_at IS DISTINCT FROM OLD.last_login_at THEN
    NEW.failed_login_attempts := 0;
    NEW.locked_until := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_failed_login_attempts() IS 'Reset failed attempts on successful login';

CREATE TRIGGER trigger_reset_failed_login_attempts
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION reset_failed_login_attempts();

-- ============================================
-- DATA INTEGRITY TRIGGERS
-- ============================================

-- Prevent deletion of users with active tickets
CREATE OR REPLACE FUNCTION prevent_user_deletion_with_active_tickets()
RETURNS TRIGGER AS $$
DECLARE
  active_ticket_count INTEGER;
BEGIN
  -- Check for active tickets
  SELECT COUNT(*) INTO active_ticket_count
  FROM support_tickets
  WHERE user_id = OLD.id
    AND status IN ('open', 'in_progress', 'pending');
  
  IF active_ticket_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete user with % active support tickets', active_ticket_count;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prevent_user_deletion_with_active_tickets() IS 'Protect data integrity';

CREATE TRIGGER trigger_prevent_user_deletion_with_active_tickets
  BEFORE DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_user_deletion_with_active_tickets();

-- ============================================
-- NOTIFICATION TRIGGERS (for application layer)
-- ============================================

-- Notify application of new support ticket
CREATE OR REPLACE FUNCTION notify_new_support_ticket()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_support_ticket',
    json_build_object(
      'ticket_id', NEW.id,
      'ticket_number', NEW.ticket_number,
      'priority', NEW.priority,
      'category', NEW.category,
      'user_id', NEW.user_id
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_new_support_ticket() IS 'Notify application via LISTEN/NOTIFY';

CREATE TRIGGER trigger_notify_new_support_ticket
  AFTER INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION notify_new_support_ticket();

-- Notify application of SLA breach
CREATE OR REPLACE FUNCTION notify_sla_breach()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when sla_breached changes from false to true
  IF NEW.sla_breached = true AND OLD.sla_breached = false THEN
    PERFORM pg_notify(
      'sla_breach',
      json_build_object(
        'ticket_id', NEW.id,
        'ticket_number', NEW.ticket_number,
        'priority', NEW.priority,
        'sla_due_at', NEW.sla_due_at
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_sla_breach() IS 'Alert on SLA violations';

CREATE TRIGGER trigger_notify_sla_breach
  AFTER UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION notify_sla_breach();

-- ============================================
-- END OF TRIGGERS
-- ============================================
