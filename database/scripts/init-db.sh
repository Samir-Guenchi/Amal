#!/bin/bash
# ============================================
# Database Initialization Script
# ============================================
# Purpose: Initialize database schema on first run
# Author: Database Administration Team
# Version: 2.0
# Last Updated: 2025-12-15
# ============================================

set -e

echo "========================================="
echo "Initializing Amal Chat Database"
echo "========================================="
echo "Database: $POSTGRES_DB"
echo "User: $POSTGRES_USER"
echo "========================================="
echo ""

# Run schema files in order
echo "Running schema files..."

if [ -d "/docker-entrypoint-initdb.d/schema" ]; then
    for file in /docker-entrypoint-initdb.d/schema/*.sql; do
        if [ -f "$file" ]; then
            echo "  - $(basename $file)"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file"
        fi
    done
    echo "✓ Schema files executed"
else
    echo "⚠ Schema directory not found"
fi

echo ""

# Run seed files
echo "Loading seed data..."

if [ -d "/docker-entrypoint-initdb.d/seeds" ]; then
    for file in /docker-entrypoint-initdb.d/seeds/*.sql; do
        if [ -f "$file" ]; then
            echo "  - $(basename $file)"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file"
        fi
    done
    echo "✓ Seed data loaded"
else
    echo "⚠ Seeds directory not found"
fi

echo ""
echo "========================================="
echo "Database initialization complete!"
echo "========================================="
