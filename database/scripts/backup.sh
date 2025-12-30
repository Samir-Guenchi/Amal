#!/bin/bash
# ============================================
# Database Backup Script
# ============================================
# Purpose: Create compressed database backups
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
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Backup file: $BACKUP_FILE"
echo ""

# Perform backup
echo -e "${YELLOW}Creating backup...${NC}"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    2>&1 | gzip > "$BACKUP_FILE"; then
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo "Backup file: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Clean up old backups
echo ""
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" -type f | wc -l)
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo "Remaining backups: $REMAINING_BACKUPS"

# Create latest symlink
echo ""
echo -e "${YELLOW}Creating 'latest' symlink...${NC}"
ln -sf "$(basename "$BACKUP_FILE")" "$BACKUP_DIR/${DB_NAME}_backup_latest.sql.gz"
echo -e "${GREEN}✓ Symlink created${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"
echo "File: $BACKUP_FILE"
echo "Size: $BACKUP_SIZE"
echo "Retention: $RETENTION_DAYS days"
echo "Total backups: $REMAINING_BACKUPS"
echo -e "${GREEN}========================================${NC}"

# Optional: Upload to cloud storage
if [ -n "$BACKUP_S3_BUCKET" ]; then
    echo ""
    echo -e "${YELLOW}Uploading to S3...${NC}"
    if aws s3 cp "$BACKUP_FILE" "s3://$BACKUP_S3_BUCKET/database-backups/"; then
        echo -e "${GREEN}✓ Uploaded to S3${NC}"
    else
        echo -e "${RED}✗ S3 upload failed${NC}"
    fi
fi

exit 0
