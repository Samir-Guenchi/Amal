#!/bin/bash
# ============================================
# Schema Validation Script
# ============================================
# Purpose: Validate database schema installation
# Author: Database Administration Team
# Version: 2.0
# Last Updated: 2025-12-15
# ============================================

set -e

# Configuration
DB_NAME="${DB_NAME:-amal_chat}"
DB_USER="${DB_USER:-amal_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Schema Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    exit 1
fi
echo ""

# Check extensions
echo -e "${YELLOW}Checking extensions...${NC}"
EXTENSIONS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm', 'btree_gin');")
if [ "$EXTENSIONS" -eq 3 ]; then
    echo -e "${GREEN}✓ All 3 extensions installed${NC}"
else
    echo -e "${RED}✗ Missing extensions (found $EXTENSIONS/3)${NC}"
fi
echo ""

# Check domains
echo -e "${YELLOW}Checking custom domains...${NC}"
DOMAINS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_type WHERE typname IN ('email_address', 'locale_code', 'timezone_name', 'phone_number_dz');")
if [ "$DOMAINS" -eq 4 ]; then
    echo -e "${GREEN}✓ All 4 custom domains created${NC}"
else
    echo -e "${RED}✗ Missing domains (found $DOMAINS/4)${NC}"
fi
echo ""

# Check lookup tables
echo -e "${YELLOW}Checking lookup tables...${NC}"
LOOKUP_TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('conversation_modes', 'conversation_statuses', 'ticket_categories', 'ticket_priorities', 'ticket_statuses');")
if [ "$LOOKUP_TABLES" -eq 5 ]; then
    echo -e "${GREEN}✓ All 5 lookup tables created${NC}"
else
    echo -e "${RED}✗ Missing lookup tables (found $LOOKUP_TABLES/5)${NC}"
fi
echo ""

# Check core tables
echo -e "${YELLOW}Checking core tables...${NC}"
CORE_TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('users', 'user_preferences', 'user_sessions', 'magic_links', 
                        'conversations', 'messages', 'decision_logs',
                        'support_tickets', 'ticket_comments', 'audit_logs');")
if [ "$CORE_TABLES" -eq 10 ]; then
    echo -e "${GREEN}✓ All 10 core tables created${NC}"
else
    echo -e "${RED}✗ Missing core tables (found $CORE_TABLES/10)${NC}"
fi
echo ""

# Check total tables
echo -e "${YELLOW}Checking total tables...${NC}"
TOTAL_TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "Total tables: $TOTAL_TABLES"
if [ "$TOTAL_TABLES" -ge 15 ]; then
    echo -e "${GREEN}✓ Expected number of tables${NC}"
else
    echo -e "${YELLOW}⚠ Fewer tables than expected${NC}"
fi
echo ""

# Check indexes
echo -e "${YELLOW}Checking indexes...${NC}"
INDEXES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")
echo "Total indexes: $INDEXES"
if [ "$INDEXES" -ge 40 ]; then
    echo -e "${GREEN}✓ Sufficient indexes created${NC}"
else
    echo -e "${YELLOW}⚠ Fewer indexes than expected (expected 40+)${NC}"
fi
echo ""

# Check triggers
echo -e "${YELLOW}Checking triggers...${NC}"
TRIGGERS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_trigger WHERE tgisinternal = false;")
echo "Total triggers: $TRIGGERS"
if [ "$TRIGGERS" -ge 10 ]; then
    echo -e "${GREEN}✓ Sufficient triggers created${NC}"
else
    echo -e "${YELLOW}⚠ Fewer triggers than expected (expected 10+)${NC}"
fi
echo ""

# Check functions
echo -e "${YELLOW}Checking functions...${NC}"
FUNCTIONS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_proc p 
     JOIN pg_namespace n ON p.pronamespace = n.oid 
     WHERE n.nspname = 'public';")
echo "Total functions: $FUNCTIONS"
if [ "$FUNCTIONS" -ge 10 ]; then
    echo -e "${GREEN}✓ Sufficient functions created${NC}"
else
    echo -e "${YELLOW}⚠ Fewer functions than expected (expected 10+)${NC}"
fi
echo ""

# Check views
echo -e "${YELLOW}Checking views...${NC}"
VIEWS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public';")
MATVIEWS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public';")
echo "Regular views: $VIEWS"
echo "Materialized views: $MATVIEWS"
if [ "$VIEWS" -ge 5 ] && [ "$MATVIEWS" -ge 1 ]; then
    echo -e "${GREEN}✓ Views created successfully${NC}"
else
    echo -e "${YELLOW}⚠ Fewer views than expected${NC}"
fi
echo ""

# Check seed data
echo -e "${YELLOW}Checking seed data...${NC}"
MODES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM conversation_modes;")
CATEGORIES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM ticket_categories;")
PRIORITIES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM ticket_priorities;")

echo "Conversation modes: $MODES"
echo "Ticket categories: $CATEGORIES"
echo "Ticket priorities: $PRIORITIES"

if [ "$MODES" -ge 2 ] && [ "$CATEGORIES" -ge 5 ] && [ "$PRIORITIES" -eq 4 ]; then
    echo -e "${GREEN}✓ Seed data loaded${NC}"
else
    echo -e "${YELLOW}⚠ Seed data may be incomplete${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Extensions: $EXTENSIONS/3"
echo "Domains: $DOMAINS/4"
echo "Lookup tables: $LOOKUP_TABLES/5"
echo "Core tables: $CORE_TABLES/10"
echo "Total tables: $TOTAL_TABLES"
echo "Indexes: $INDEXES"
echo "Triggers: $TRIGGERS"
echo "Functions: $FUNCTIONS"
echo "Views: $VIEWS regular + $MATVIEWS materialized"
echo "Seed data: $MODES modes, $CATEGORIES categories, $PRIORITIES priorities"
echo -e "${BLUE}========================================${NC}"

# Final status
if [ "$EXTENSIONS" -eq 3 ] && [ "$DOMAINS" -eq 4 ] && [ "$LOOKUP_TABLES" -eq 5 ] && [ "$CORE_TABLES" -eq 10 ]; then
    echo -e "${GREEN}✓ Schema validation PASSED${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Schema validation completed with warnings${NC}"
    exit 1
fi
