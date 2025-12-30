-- ============================================
-- Security and Permissions
-- ============================================
-- Purpose: Database roles, permissions, and security policies
-- Dependencies: All previous schema files
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- ============================================
-- DATABASE ROLES
-- ============================================

-- Application role (read/write access)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'amal_app') THEN
    CREATE ROLE amal_app WITH LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
  END IF;
END
$$;

COMMENT ON ROLE amal_app IS 'Application service account with read/write access';

-- Read-only role (for analytics and reporting)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'amal_readonly') THEN
    CREATE ROLE amal_readonly WITH LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
  END IF;
END
$$;

COMMENT ON ROLE amal_readonly IS 'Read-only access for analytics and reporting';

-- Admin role (full access)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'amal_admin') THEN
    CREATE ROLE amal_admin WITH LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION' SUPERUSER;
  END IF;
END
$$;

COMMENT ON ROLE amal_admin IS 'Administrative access for database management';

-- ============================================
-- GRANT PERMISSIONS - Application Role
-- ============================================

-- Database and schema access
GRANT CONNECT ON DATABASE postgres TO amal_app;
GRANT USAGE ON SCHEMA public TO amal_app;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO amal_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO amal_app;

-- Function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO amal_app;

-- Future objects (auto-grant)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO amal_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO amal_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT EXECUTE ON FUNCTIONS TO amal_app;

-- Specific restrictions for application role
REVOKE DELETE ON audit_logs FROM amal_app;
REVOKE UPDATE ON audit_logs FROM amal_app;

COMMENT ON ROLE amal_app IS 'Cannot modify or delete audit logs';

-- ============================================
-- GRANT PERMISSIONS - Read-Only Role
-- ============================================

-- Database and schema access
GRANT CONNECT ON DATABASE postgres TO amal_readonly;
GRANT USAGE ON SCHEMA public TO amal_readonly;

-- Read-only table access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO amal_readonly;

-- Read-only function access (for views and reporting functions)
GRANT EXECUTE ON FUNCTION get_conversation_summary(UUID) TO amal_readonly;
GRANT EXECUTE ON FUNCTION get_ticket_statistics_by_category(TIMESTAMPTZ, TIMESTAMPTZ) TO amal_readonly;
GRANT EXECUTE ON FUNCTION get_user_activity_summary(UUID) TO amal_readonly;
GRANT EXECUTE ON FUNCTION search_messages(TEXT, VARCHAR, INTEGER) TO amal_readonly;
GRANT EXECUTE ON FUNCTION get_daily_statistics(DATE, DATE) TO amal_readonly;
GRANT EXECUTE ON FUNCTION refresh_daily_statistics() TO amal_readonly;

-- Future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT ON TABLES TO amal_readonly;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON users
  FOR ALL
  TO amal_app
  USING (id = current_setting('app.current_user_id', true)::UUID);

-- Policy: Users can only see their own sessions
CREATE POLICY session_isolation_policy ON user_sessions
  FOR ALL
  TO amal_app
  USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Policy: Users can only see their own audit logs
CREATE POLICY audit_isolation_policy ON audit_logs
  FOR SELECT
  TO amal_app
  USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Bypass RLS for admin role
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE user_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

COMMENT ON POLICY user_isolation_policy ON users IS 'Users can only access their own data';
COMMENT ON POLICY session_isolation_policy ON user_sessions IS 'Users can only access their own sessions';
COMMENT ON POLICY audit_isolation_policy ON audit_logs IS 'Users can only view their own audit logs';

-- ============================================
-- SECURITY BEST PRACTICES
-- ============================================

-- Revoke public schema permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Ensure secure defaults
ALTER DATABASE postgres SET log_connections = 'on';
ALTER DATABASE postgres SET log_disconnections = 'on';
ALTER DATABASE postgres SET log_duration = 'on';
ALTER DATABASE postgres SET log_statement = 'mod'; -- Log modifications only

-- Connection limits
ALTER ROLE amal_app CONNECTION LIMIT 50;
ALTER ROLE amal_readonly CONNECTION LIMIT 20;

-- ============================================
-- ENCRYPTION AND DATA PROTECTION
-- ============================================

-- Note: These are recommendations to be implemented at infrastructure level:
-- 1. Enable SSL/TLS for all connections (postgresql.conf: ssl = on)
-- 2. Use pgcrypto extension for sensitive data encryption
-- 3. Enable transparent data encryption (TDE) if available
-- 4. Regular security audits and penetration testing
-- 5. Implement connection pooling with PgBouncer
-- 6. Use strong passwords (minimum 16 characters, mixed case, numbers, symbols)
-- 7. Rotate passwords regularly (every 90 days)
-- 8. Enable audit logging for all DDL and DML operations
-- 9. Implement IP whitelisting at firewall level
-- 10. Regular backup encryption and secure storage

-- ============================================
-- SECURITY MONITORING
-- ============================================

-- Create view for security monitoring
CREATE OR REPLACE VIEW v_security_audit AS
SELECT 
  al.created_at,
  al.user_id,
  u.email,
  al.action,
  al.resource_type,
  al.resource_id,
  al.ip_address,
  al.status_code,
  al.error_message
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;

COMMENT ON VIEW v_security_audit IS 'Recent security events for monitoring';

-- Grant access to security view
GRANT SELECT ON v_security_audit TO amal_admin;
GRANT SELECT ON v_security_audit TO amal_readonly;

-- ============================================
-- PASSWORD POLICIES
-- ============================================

-- Function to validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Minimum 8 characters
  IF LENGTH(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one digit
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_password_strength(TEXT) IS 'Validate password meets security requirements';

-- ============================================
-- SECURITY NOTES
-- ============================================

-- IMPORTANT SECURITY REMINDERS:
-- 1. Change all default passwords immediately in production
-- 2. Use environment variables for database credentials
-- 3. Never commit passwords to version control
-- 4. Implement rate limiting at application layer
-- 5. Use prepared statements to prevent SQL injection
-- 6. Sanitize all user inputs
-- 7. Implement CSRF protection
-- 8. Use httpOnly and secure flags for cookies
-- 9. Enable database connection encryption (SSL/TLS)
-- 10. Regular security updates and patches

-- ============================================
-- END OF SECURITY
-- ============================================
