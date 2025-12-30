#!/bin/bash
set -e

echo "Initializing Amal Chat Platform database..."

# Wait for PostgreSQL to be ready
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Enable extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Extensions are already enabled in schema.sql
    SELECT 'Database initialized successfully!' as status;
EOSQL

echo "Database initialization complete!"
