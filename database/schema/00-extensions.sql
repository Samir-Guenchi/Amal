-- ============================================
-- PostgreSQL Extensions
-- ============================================
-- Purpose: Enable required PostgreSQL extensions
-- Dependencies: None
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search (Arabic support)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Composite indexes
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Query statistics (for performance monitoring)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Verify extensions
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'btree_gin', 'pg_stat_statements');

-- Log installation
DO $$
BEGIN
  RAISE NOTICE 'Extensions installed successfully';
  RAISE NOTICE 'uuid-ossp: UUID generation';
  RAISE NOTICE 'pg_trgm: Full-text search';
  RAISE NOTICE 'btree_gin: Composite indexes';
  RAISE NOTICE 'pg_stat_statements: Query statistics';
END $$;
