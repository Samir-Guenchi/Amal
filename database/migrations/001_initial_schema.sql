-- ============================================
-- Migration: 001_initial_schema
-- Description: Initial database schema setup
-- Author: Database Administration Team
-- Date: 2025-12-15
-- ============================================

BEGIN;

-- Execute schema files in order
\i ../schema/00-extensions.sql
\i ../schema/01-domains.sql
\i ../schema/02-lookup-tables.sql
\i ../schema/03-core-tables.sql
\i ../schema/04-indexes.sql
\i ../schema/05-triggers.sql
\i ../schema/06-functions.sql
\i ../schema/07-views.sql
\i ../schema/08-security.sql

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 completed successfully';
  RAISE NOTICE 'Database version: 2.0';
  RAISE NOTICE 'Schema: Amal Chat Platform';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, restore from backup:
-- ./scripts/restore.sh backup_before_001.sql.gz
-- ============================================
