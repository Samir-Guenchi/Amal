#!/bin/bash
# ============================================
# Database Restore Script
# ============================================
# Purpose: Restore database from backup
# Author: Database Administration Team
# Version: 2.0
# Last Updated: 2025-12-15
# ============================================

set -e  # Exit on error

# Configuration
DB_NAME="${DB_NAME:-amal_chat}"
DB_USER="${DB_USER:-amal_app}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/${DB_NAME}_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    echo ""
    echo "Example:"
    echo "  $0 $BACKUP_DIR/${DB_NAME}_backup_20250115_120000.sql.gz"
    echo "  $0 $BACKUP_DIR/${DB_NAME}_backup_latest.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${RED}========================================${NC}"
echo -e "${RED}WARNING: DATABASE RESTORE${NC}"
echo -e "${RED}========================================${NC}"
echo "This will REPLACE all data in the database!"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Create a safety backup before restore
echo ""
echo -e "${YELLOW}Creating safety backup before restore...${NC}"
SAFETY_BACKUP="$BACKUP_DIR/${DB_NAME}_before_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain --no-owner --no-acl 2>&1 | gzip > "$SAFETY_BACKUP"; then
    echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP${NC}"
else
    echo -e "${RED}✗ Safety backup failed${NC}"
    read -p "Continue anyway? (type 'yes' to confirm): " FORCE_CONTINUE
    if [ "$FORCE_CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

# Terminate active connections
echo ""
echo -e "${YELLOW}Terminating active connections...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null || true
echo -e "${GREEN}✓ Connections terminated${NC}"

# Drop and recreate database
echo ""
echo -e "${YELLOW}Dropping and recreating database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
echo -e "${GREEN}✓ Database recreated${NC}"

# Restore from backup
echo ""
echo -e "${YELLOW}Restoring from backup...${NC}"
if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Restore completed successfully${NC}"
else
    echo -e "${RED}✗ Restore failed${NC}"
    echo -e "${YELLOW}Attempting to restore safety backup...${NC}"
    if [ -f "$SAFETY_BACKUP" ]; then
        gunzip -c "$SAFETY_BACKUP" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
        echo -e "${GREEN}✓ Safety backup restored${NC}"
    fi
    exit 1
fi

# Verify restore
echo ""
echo -e "${YELLOW}Verifying restore...${NC}"
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "Tables found: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Verification passed${NC}"
else
    echo -e "${RED}✗ Verification failed - no tables found${NC}"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Restore Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo "Tables restored: $TABLE_COUNT"
echo "Safety backup: $SAFETY_BACKUP"
echo -e "${GREEN}========================================${NC}"

exit 0
