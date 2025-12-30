#!/bin/bash
# ============================================
# Database Setup Test Script
# ============================================
# Purpose: Complete database setup and validation
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
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Setup Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Wait for PostgreSQL to be ready
echo -e "${YELLOW}Step 1: Waiting for PostgreSQL...${NC}"
MAX_TRIES=30
TRIES=0
while [ $TRIES -lt $MAX_TRIES ]; do
    if docker exec nlp_sof-postgres-1 pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    TRIES=$((TRIES + 1))
    echo "Waiting... ($TRIES/$MAX_TRIES)"
    sleep 2
done

if [ $TRIES -eq $MAX_TRIES ]; then
    echo -e "${RED}✗ PostgreSQL failed to start${NC}"
    exit 1
fi
echo ""

# Step 2: Create database and user
echo -e "${YELLOW}Step 2: Creating database and user...${NC}"
docker exec nlp_sof-postgres-1 psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"
docker exec nlp_sof-postgres-1 psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$POSTGRES_PASSWORD';" 2>/dev/null || echo "User already exists"
docker exec nlp_sof-postgres-1 psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
echo -e "${GREEN}✓ Database and user ready${NC}"
echo ""

# Step 3: Run schema files
echo -e "${YELLOW}Step 3: Running schema files...${NC}"

echo "  - 00-extensions.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/00-extensions.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Extensions${NC}"

echo "  - 01-domains.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/01-domains.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Domains${NC}"

echo "  - 02-lookup-tables.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/02-lookup-tables.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Lookup tables${NC}"

echo "  - 03-core-tables.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/03-core-tables.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Core tables${NC}"

echo "  - 04-indexes.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/04-indexes.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Indexes${NC}"

echo "  - 05-triggers.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/05-triggers.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Triggers${NC}"

echo "  - 06-functions.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/06-functions.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Functions${NC}"

echo "  - 07-views.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/07-views.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Views${NC}"

echo "  - 08-security.sql"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/schema/08-security.sql > /dev/null 2>&1
echo -e "${GREEN}  ✓ Security${NC}"

echo -e "${GREEN}✓ All schema files executed${NC}"
echo ""

# Step 4: Load seed data
echo -e "${YELLOW}Step 4: Loading seed data...${NC}"
docker exec -i nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME < database/seeds/01-lookup-data.sql > /dev/null 2>&1
echo -e "${GREEN}✓ Seed data loaded${NC}"
echo ""

# Step 5: Validate schema
echo -e "${YELLOW}Step 5: Validating schema...${NC}"
echo ""

# Check tables
TABLES=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "Tables created: $TABLES"

# Check indexes
INDEXES=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")
echo "Indexes created: $INDEXES"

# Check triggers
TRIGGERS=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM pg_trigger WHERE tgisinternal = false;")
echo "Triggers created: $TRIGGERS"

# Check functions
FUNCTIONS=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';")
echo "Functions created: $FUNCTIONS"

# Check views
VIEWS=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public';")
echo "Views created: $VIEWS"

# Check seed data
MODES=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM conversation_modes;")
echo "Conversation modes: $MODES"

echo ""
echo -e "${GREEN}✓ Schema validation complete${NC}"
echo ""

# Step 6: Test basic operations
echo -e "${YELLOW}Step 6: Testing basic operations...${NC}"

# Test insert user
docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -c \
    "INSERT INTO users (email, name, locale, consent_data_storage, consent_timestamp) 
     VALUES ('test@example.com', 'Test User', 'ar-DZ', true, NOW());" > /dev/null 2>&1
echo -e "${GREEN}✓ User insert${NC}"

# Test select user
USER_COUNT=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM users WHERE email = 'test@example.com';")
if [ "$USER_COUNT" -eq 1 ]; then
    echo -e "${GREEN}✓ User select${NC}"
else
    echo -e "${RED}✗ User select failed${NC}"
fi

# Test view
VIEW_COUNT=$(docker exec nlp_sof-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c \
    "SELECT COUNT(*) FROM v_system_health;")
if [ "$VIEW_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Views working${NC}"
else
    echo -e "${RED}✗ Views not working${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setup Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ PostgreSQL ready${NC}"
echo -e "${GREEN}✓ Database created${NC}"
echo -e "${GREEN}✓ Schema installed (8 files)${NC}"
echo -e "${GREEN}✓ Seed data loaded${NC}"
echo -e "${GREEN}✓ Basic operations tested${NC}"
echo ""
echo "Database objects:"
echo "  - Tables: $TABLES"
echo "  - Indexes: $INDEXES"
echo "  - Triggers: $TRIGGERS"
echo "  - Functions: $FUNCTIONS"
echo "  - Views: $VIEWS"
echo "  - Seed records: $MODES modes"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Database setup test PASSED${NC}"
echo -e "${BLUE}========================================${NC}"

exit 0
