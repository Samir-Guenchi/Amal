#!/bin/bash
# ============================================
# Database Maintenance Script
# ============================================
# Purpose: Routine database maintenance tasks
# Author: Database Administration Team
# Version: 2.0
# Last Updated: 2025-12-15
# ============================================

set -e

# Configuration
DB_NAME="${DB_NAME:-amal_chat}"
DB_USER="${DB_USER:-amal_app}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse command line arguments
TASK="${1:-all}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Maintenance${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Database: $DB_NAME"
echo "Task: $TASK"
echo "Timestamp: $(date)"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function: Vacuum and analyze
vacuum_analyze() {
    echo -e "${YELLOW}Running VACUUM ANALYZE...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE;"
    echo -e "${GREEN}✓ VACUUM ANALYZE completed${NC}"
    echo ""
}

# Function: Reindex
reindex() {
    echo -e "${YELLOW}Reindexing database...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "REINDEX DATABASE $DB_NAME;"
    echo -e "${GREEN}✓ Reindex completed${NC}"
    echo ""
}

# Function: Update statistics
update_stats() {
    echo -e "${YELLOW}Updating table statistics...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE;"
    echo -e "${GREEN}✓ Statistics updated${NC}"
    echo ""
}

# Function: Clean up old data
cleanup_old_data() {
    echo -e "${YELLOW}Cleaning up old data...${NC}"
    
    # Archive old conversations (90+ days inactive)
    ARCHIVED=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT archive_old_conversations(90);")
    echo "  Archived conversations: $ARCHIVED"
    
    # Clean up expired magic links
    MAGIC_LINKS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT cleanup_expired_magic_links();")
    echo "  Deleted magic links: $MAGIC_LINKS"
    
    # Clean up expired sessions
    SESSIONS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT cleanup_expired_sessions();")
    echo "  Deleted sessions: $SESSIONS"
    
    echo -e "${GREEN}✓ Cleanup completed${NC}"
    echo ""
}

# Function: Refresh materialized views
refresh_views() {
    echo -e "${YELLOW}Refreshing materialized views...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT refresh_daily_statistics();"
    echo -e "${GREEN}✓ Materialized views refreshed${NC}"
    echo ""
}

# Function: Check database size
check_size() {
    echo -e "${YELLOW}Database size information:${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT 
            pg_size_pretty(pg_database_size('$DB_NAME')) as database_size,
            pg_size_pretty(pg_total_relation_size('users')) as users_size,
            pg_size_pretty(pg_total_relation_size('conversations')) as conversations_size,
            pg_size_pretty(pg_total_relation_size('messages')) as messages_size,
            pg_size_pretty(pg_total_relation_size('support_tickets')) as tickets_size,
            pg_size_pretty(pg_total_relation_size('audit_logs')) as audit_logs_size;"
    echo ""
}

# Function: Check index usage
check_indexes() {
    echo -e "${YELLOW}Index usage statistics:${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as scans,
            pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes
        WHERE idx_scan < 100
        ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC
        LIMIT 10;"
    echo ""
}

# Function: Check table bloat
check_bloat() {
    echo -e "${YELLOW}Checking for table bloat...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
            n_dead_tup as dead_tuples,
            ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
        ORDER BY n_dead_tup DESC
        LIMIT 10;"
    echo ""
}

# Function: Check slow queries
check_slow_queries() {
    echo -e "${YELLOW}Checking for slow queries (requires pg_stat_statements):${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT 
            query,
            calls,
            ROUND(total_exec_time::numeric, 2) as total_time_ms,
            ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
            ROUND(max_exec_time::numeric, 2) as max_time_ms
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_exec_time DESC
        LIMIT 10;" 2>/dev/null || echo "pg_stat_statements not available"
    echo ""
}

# Execute tasks based on argument
case "$TASK" in
    "vacuum")
        vacuum_analyze
        ;;
    "reindex")
        reindex
        ;;
    "analyze")
        update_stats
        ;;
    "cleanup")
        cleanup_old_data
        ;;
    "refresh")
        refresh_views
        ;;
    "size")
        check_size
        ;;
    "indexes")
        check_indexes
        ;;
    "bloat")
        check_bloat
        ;;
    "slow")
        check_slow_queries
        ;;
    "all")
        cleanup_old_data
        vacuum_analyze
        update_stats
        refresh_views
        check_size
        check_bloat
        ;;
    *)
        echo -e "${RED}Unknown task: $TASK${NC}"
        echo ""
        echo "Usage: $0 [task]"
        echo ""
        echo "Available tasks:"
        echo "  all       - Run all maintenance tasks (default)"
        echo "  vacuum    - VACUUM ANALYZE database"
        echo "  reindex   - Reindex all tables"
        echo "  analyze   - Update table statistics"
        echo "  cleanup   - Clean up old data"
        echo "  refresh   - Refresh materialized views"
        echo "  size      - Show database size"
        echo "  indexes   - Show index usage"
        echo "  bloat     - Check for table bloat"
        echo "  slow      - Show slow queries"
        exit 1
        ;;
esac

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Maintenance completed successfully${NC}"
echo -e "${GREEN}========================================${NC}"

exit 0
