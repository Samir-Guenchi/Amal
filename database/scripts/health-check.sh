#!/bin/bash
# ============================================
# Database Health Check Script
# ============================================
# Purpose: Monitor database health and performance
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

# Health status
HEALTH_STATUS="healthy"
WARNINGS=0
ERRORS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Timestamp: $(date)"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function: Check connection
check_connection() {
    echo -e "${YELLOW}Checking database connection...${NC}"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Connection successful${NC}"
    else
        echo -e "${RED}✗ Connection failed${NC}"
        HEALTH_STATUS="critical"
        ((ERRORS++))
    fi
    echo ""
}

# Function: Check database size
check_database_size() {
    echo -e "${YELLOW}Checking database size...${NC}"
    SIZE=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
    echo "Database size: $SIZE"
    echo ""
}

# Function: Check active connections
check_connections() {
    echo -e "${YELLOW}Checking active connections...${NC}"
    ACTIVE=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = '$DB_NAME';")
    MAX=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT setting FROM pg_settings WHERE name = 'max_connections';")
    
    echo "Active connections: $ACTIVE / $MAX"
    
    if [ "$ACTIVE" -gt $((MAX * 80 / 100)) ]; then
        echo -e "${RED}✗ Connection pool near capacity${NC}"
        HEALTH_STATUS="warning"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ Connection pool healthy${NC}"
    fi
    echo ""
}

# Function: Check table counts
check_table_counts() {
    echo -e "${YELLOW}Checking table counts...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT 
            'users' as table_name,
            COUNT(*) as count
        FROM users WHERE deleted_at IS NULL
        UNION ALL
        SELECT 'conversations', COUNT(*) FROM conversations
        UNION ALL
        SELECT 'messages', COUNT(*) FROM messages WHERE deleted_at IS NULL
        UNION ALL
        SELECT 'support_tickets', COUNT(*) FROM support_tickets
        UNION ALL
        SELECT 'audit_logs', COUNT(*) FROM audit_logs;"
    echo ""
}

# Function: Check for long-running queries
check_long_queries() {
    echo -e "${YELLOW}Checking for long-running queries...${NC}"
    LONG_QUERIES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM pg_stat_activity 
         WHERE state = 'active' 
         AND query_start < NOW() - INTERVAL '5 minutes'
         AND query NOT LIKE '%pg_stat_activity%';")
    
    if [ "$LONG_QUERIES" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Found $LONG_QUERIES long-running queries${NC}"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "SELECT 
                pid,
                usename,
                LEFT(query, 50) as query,
                NOW() - query_start as duration
            FROM pg_stat_activity 
            WHERE state = 'active' 
            AND query_start < NOW() - INTERVAL '5 minutes'
            AND query NOT LIKE '%pg_stat_activity%';"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ No long-running queries${NC}"
    fi
    echo ""
}

# Function: Check for locks
check_locks() {
    echo -e "${YELLOW}Checking for locks...${NC}"
    LOCKS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM pg_locks WHERE NOT granted;")
    
    if [ "$LOCKS" -gt 0 ]; then
        echo -e "${RED}✗ Found $LOCKS blocked queries${NC}"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "SELECT 
                blocked_locks.pid AS blocked_pid,
                blocked_activity.usename AS blocked_user,
                blocking_locks.pid AS blocking_pid,
                blocking_activity.usename AS blocking_user,
                LEFT(blocked_activity.query, 50) AS blocked_query
            FROM pg_catalog.pg_locks blocked_locks
            JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
            JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
            JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
            WHERE NOT blocked_locks.granted AND blocking_locks.granted;"
        HEALTH_STATUS="warning"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ No locks detected${NC}"
    fi
    echo ""
}

# Function: Check replication lag (if applicable)
check_replication() {
    echo -e "${YELLOW}Checking replication status...${NC}"
    IS_REPLICA=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT pg_is_in_recovery();" 2>/dev/null || echo "f")
    
    if [ "$IS_REPLICA" = " t" ]; then
        LAG=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
            "SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()));" 2>/dev/null || echo "0")
        echo "Replication lag: ${LAG}s"
        
        if (( $(echo "$LAG > 60" | bc -l) )); then
            echo -e "${RED}✗ Replication lag is high${NC}"
            HEALTH_STATUS="warning"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓ Replication lag is acceptable${NC}"
        fi
    else
        echo "Not a replica (primary database)"
    fi
    echo ""
}

# Function: Check disk space
check_disk_space() {
    echo -e "${YELLOW}Checking disk space...${NC}"
    df -h | grep -E "Filesystem|/var/lib/postgresql" || df -h | head -2
    echo ""
}

# Function: Check SLA breaches
check_sla_breaches() {
    echo -e "${YELLOW}Checking SLA breaches...${NC}"
    BREACHED=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM support_tickets 
         WHERE sla_breached = true 
         AND status IN ('open', 'in_progress', 'pending');")
    
    if [ "$BREACHED" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Found $BREACHED tickets with SLA breach${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ No SLA breaches${NC}"
    fi
    echo ""
}

# Function: Check system health metrics
check_system_health() {
    echo -e "${YELLOW}System health metrics:${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT * FROM v_system_health;"
    echo ""
}

# Run all checks
check_connection
check_database_size
check_connections
check_table_counts
check_long_queries
check_locks
check_replication
check_disk_space
check_sla_breaches
check_system_health

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Health Check Summary${NC}"
echo -e "${BLUE}========================================${NC}"

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo -e "${GREEN}Status: HEALTHY ✓${NC}"
elif [ "$HEALTH_STATUS" = "warning" ]; then
    echo -e "${YELLOW}Status: WARNING ⚠${NC}"
else
    echo -e "${RED}Status: CRITICAL ✗${NC}"
fi

echo "Warnings: $WARNINGS"
echo "Errors: $ERRORS"
echo -e "${BLUE}========================================${NC}"

# Exit with appropriate code
if [ "$HEALTH_STATUS" = "critical" ]; then
    exit 2
elif [ "$HEALTH_STATUS" = "warning" ]; then
    exit 1
else
    exit 0
fi
