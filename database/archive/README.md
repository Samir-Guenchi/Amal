# Archive

This folder contains archived database files from previous versions.

## Files

### schema-optimized-v1.sql
- **Version**: 1.0
- **Date**: December 15, 2025
- **Description**: Original monolithic schema file (600+ lines)
- **Status**: Replaced by modular structure in `schema/` folder

## Why Archived?

The original monolithic schema was replaced with a modular structure following software engineering best practices:

- **Modularity**: 8 separate files instead of 1 large file
- **SOLID Principles**: Each file has single responsibility
- **Maintainability**: Easier to update and extend
- **Version Control**: Better diff tracking
- **Documentation**: Clearer organization

## Migration Path

Old structure:
```
backend/src/db/schema-optimized.sql  (600+ lines)
```

New structure:
```
database/
├── schema/
│   ├── 00-extensions.sql
│   ├── 01-domains.sql
│   ├── 02-lookup-tables.sql
│   ├── 03-core-tables.sql
│   ├── 04-indexes.sql
│   ├── 05-triggers.sql
│   ├── 06-functions.sql
│   ├── 07-views.sql
│   └── 08-security.sql
```

## Do Not Use

These files are kept for reference only. Use the modular schema files in `database/schema/` for all new deployments.

---

**Archived**: December 15, 2025  
**Reason**: Replaced by modular structure
