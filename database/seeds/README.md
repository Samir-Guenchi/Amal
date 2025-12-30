# Database Seeds

## Overview

Seed files contain initial reference data required for the application to function.

## Seed Files

### 01-lookup-data.sql
Populates lookup tables with reference data:
- Conversation modes (AUTO, SUPPORT)
- Conversation statuses (active, archived, escalated, closed)
- Ticket categories (crisis, addiction, mental_health, etc.)
- Ticket priorities (low, medium, high, urgent)
- Ticket statuses (open, in_progress, pending, resolved, closed)

## Running Seeds

### Development
```bash
cd database/seeds
psql -U amal_user -d amal_chat -f 01-lookup-data.sql
```

### Production
```bash
# Seeds are safe to run multiple times (uses ON CONFLICT)
psql -U amal_app -d amal_chat -f seeds/01-lookup-data.sql
```

### Docker
```bash
docker-compose exec postgres psql -U amal_user -d amal_chat -f /seeds/01-lookup-data.sql
```

## Seed Data Details

### Conversation Modes
- **AUTO**: AI decides between RAG API or SUPPORT
- **SUPPORT**: Direct human support ticket

### Ticket Categories (Algeria-specific)
- **Crisis** (🆘): Immediate intervention - 2 hour SLA
- **Addiction** (💊): Drug addiction support
- **Mental Health** (🧠): Psychological support
- **Prevention** (🛡️): Education and prevention
- **Resources** (📚): Information about services
- **Family Support** (👨‍👩‍👧‍👦): Family counseling
- **Relapse** (🔄): Relapse prevention
- **General** (💬): General inquiries

### Ticket Priorities & SLA
- **Low**: 72 hours SLA
- **Medium**: 24 hours SLA
- **High**: 8 hours SLA
- **Urgent**: 2 hours SLA

## Updating Seed Data

### Modify Existing Data
Edit the seed file and re-run:
```bash
psql -U amal_user -d amal_chat -f 01-lookup-data.sql
```

The `ON CONFLICT` clause ensures safe updates.

### Add New Categories
```sql
INSERT INTO ticket_categories (code, name_ar, name_fr, name_en, description, icon, sort_order) VALUES
  ('new_category', 'اسم عربي', 'Nom français', 'English Name', 'Description', '🔖', 10);
```

## Verification

After running seeds:
```bash
# Check conversation modes
psql -U amal_user -d amal_chat -c "SELECT * FROM conversation_modes;"

# Check ticket categories
psql -U amal_user -d amal_chat -c "SELECT * FROM ticket_categories ORDER BY sort_order;"

# Check ticket priorities
psql -U amal_user -d amal_chat -c "SELECT * FROM ticket_priorities ORDER BY level;"
```

## Best Practices

1. **Idempotent**: Seeds should be safe to run multiple times
2. **Use ON CONFLICT**: Prevent duplicate key errors
3. **Multilingual**: Include Arabic, French, and English
4. **Documented**: Comment all seed data
5. **Versioned**: Track changes in version control

## Troubleshooting

### Duplicate Key Error
```bash
# Seeds use ON CONFLICT, but if you get errors:
psql -U amal_user -d amal_chat -c "SELECT * FROM conversation_modes WHERE code = 'AUTO';"

# Delete and re-run if needed
psql -U amal_user -d amal_chat -c "DELETE FROM conversation_modes WHERE code = 'AUTO';"
```

### Foreign Key Violations
Ensure schema is created before running seeds:
```bash
psql -U amal_user -d amal_chat -f migrations/001_initial_schema.sql
psql -U amal_user -d amal_chat -f seeds/01-lookup-data.sql
```

## Support

- **DBA Team**: dba@amal.dz
- **Documentation**: See `../docs/`
