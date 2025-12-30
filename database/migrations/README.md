# Database Migrations

## Overview

This directory contains database migration files for version control and deployment.

## Migration Strategy

### Naming Convention
```
<version>_<description>.sql
```

Examples:
- `001_initial_schema.sql`
- `002_add_user_preferences.sql`
- `003_add_ticket_escalation.sql`

### Migration Order

1. **001_initial_schema.sql** - Complete initial database setup
2. Future migrations numbered sequentially

## Running Migrations

### Development
```bash
psql -U amal_user -d amal_chat -f migrations/001_initial_schema.sql
```

### Production
```bash
# Always backup first!
./scripts/backup.sh

# Run migration
psql -U amal_app -d amal_chat -f migrations/001_initial_schema.sql

# Verify
./scripts/health-check.sh
```

### Docker
```bash
docker-compose exec postgres psql -U amal_user -d amal_chat -f /migrations/001_initial_schema.sql
```

## Creating New Migrations

### 1. Create Migration File
```bash
cd database/migrations
touch 002_your_migration_name.sql
```

### 2. Write Migration
```sql
-- Migration: 002_your_migration_name
-- Description: Brief description of changes
-- Author: Your Name
-- Date: YYYY-MM-DD

BEGIN;

-- Your changes here
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- Rollback instructions (as comments)
-- ROLLBACK: ALTER TABLE users DROP COLUMN new_field;

COMMIT;
```

### 3. Test Migration
```bash
# Test on development database
psql -U amal_user -d amal_chat_dev -f 002_your_migration_name.sql

# Verify changes
psql -U amal_user -d amal_chat_dev -c "\d users"
```

### 4. Document Migration
Update this README with:
- Migration number and description
- Any manual steps required
- Rollback procedure

## Migration Checklist

Before running in production:

- [ ] Tested on development environment
- [ ] Tested on staging environment
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Downtime scheduled (if needed)
- [ ] Monitoring in place

## Rollback Procedures

### Automatic Rollback
If migration is wrapped in transaction:
```sql
BEGIN;
-- migration code
COMMIT;
```

If error occurs, transaction automatically rolls back.

### Manual Rollback
```bash
# Restore from backup
./scripts/restore.sh backup_before_migration.sql.gz
```

## Migration History

| Version | Description | Date | Author | Status |
|---------|-------------|------|--------|--------|
| 001 | Initial schema | 2025-12-15 | DBA Team | ✅ Complete |

## Best Practices

1. **Always use transactions** - Wrap migrations in BEGIN/COMMIT
2. **Test thoroughly** - Test on dev and staging first
3. **Backup first** - Always backup before production migrations
4. **Document rollback** - Include rollback instructions
5. **Small changes** - Keep migrations focused and small
6. **Idempotent** - Use IF EXISTS/IF NOT EXISTS where possible
7. **No data loss** - Never drop columns with data without backup
8. **Performance** - Consider impact on large tables
9. **Indexes** - Create indexes CONCURRENTLY in production
10. **Monitor** - Watch for locks and performance issues

## Troubleshooting

### Migration Fails
```bash
# Check error message
psql -U amal_user -d amal_chat -f migration.sql 2>&1 | tee migration.log

# Check database state
psql -U amal_user -d amal_chat -c "\dt"

# Rollback if needed
./scripts/restore.sh backup.sql.gz
```

### Long-Running Migration
```bash
# Check active queries
psql -U amal_admin -d amal_chat -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check locks
psql -U amal_admin -d amal_chat -c "SELECT * FROM pg_locks WHERE NOT granted;"
```

## Support

- **DBA Team**: dba@amal.dz
- **Documentation**: See `../docs/`
- **Emergency**: See `../docs/TROUBLESHOOTING.md`
