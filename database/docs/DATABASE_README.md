# Amal Chat Platform - Database Documentation

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Schema Design](#schema-design)
4. [Normalization](#normalization)
5. [Tables Reference](#tables-reference)
6. [Indexes & Performance](#indexes--performance)
7. [Triggers & Functions](#triggers--functions)
8. [Views & Materialized Views](#views--materialized-views)
9. [Security](#security)
10. [Backup & Recovery](#backup--recovery)
11. [Monitoring](#monitoring)
12. [Docker Setup](#docker-setup)
13. [Migration Guide](#migration-guide)

---

## Overview

The Amal Chat Platform database is a PostgreSQL 14+ database optimized for:
- **Intelligent chatbot conversations** with AUTO mode decision-making
- **RAG (Retrieval-Augmented Generation)** using pgvector for semantic search
- **Support ticket management** with SLA tracking
- **Comprehensive audit logging** for security and compliance
- **Multi-language support** (Arabic, French, English)
- **Algeria-specific localization** (Africa/Algiers timezone)

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 22 |
| Core Tables | 18 |
| Lookup Tables | 4 |
| Indexes | 40+ |
| Triggers | 6 |
| Functions | 4 |
| Views | 4 |
| Materialized Views | 1 |

### Technology Stack

- **Database**: PostgreSQL 14+
- **Extensions**: pgvector, pg_trgm, btree_gin
- **Vector Dimensions**: 1536 (OpenAI ada-002)
- **Normalization**: Third Normal Form (3NF)
- **Timezone**: Africa/Algiers (UTC+1)

---

## Architecture

### Entity Groups

```
┌─────────────────────────────────────────────────────────────┐
│                    Amal Database Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     User     │  │ Conversation │  │     RAG      │      │
│  │  Management  │  │    System    │  │    System    │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ • users      │  │ • conversations│ │ • documents  │      │
│  │ • preferences│  │ • messages   │  │ • chunks     │      │
│  │ • sessions   │  │ • decisions  │  │ • embeddings │      │
│  │ • magic_links│  │ • modes      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Support    │  │    Audit     │                         │
│  │    System    │  │  & Security  │                         │
│  ├──────────────┤  ├──────────────┤                         │
│  │ • tickets    │  │ • audit_logs │                         │
│  │ • comments   │  │ • sessions   │                         │
│  │ • categories │  │              │                         │
│  │ • priorities │  │              │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Request
    ↓
Authentication (users, user_sessions)
    ↓
Conversation (conversations, messages)
    ↓
AUTO Mode Decision (decision_logs)
    ↓
    ├─→ RAG Mode (documents, document_chunks, pgvector)
    │       ↓
    │   Semantic Search
    │       ↓
    │   Generate Response
    │
    └─→ SUPPORT Mode (support_tickets, ticket_comments)
            ↓
        Create Ticket
            ↓
        Notify Team
```

---

## Schema Design

### Core Principles

1. **Normalization**: All tables follow 3NF (Third Normal Form)
2. **Referential Integrity**: Foreign keys with appropriate CASCADE rules
3. **Data Integrity**: CHECK constraints for business rules
4. **Soft Deletes**: `deleted_at` timestamp for recoverable deletions
5. **Audit Trail**: Comprehensive logging in `audit_logs`
6. **Timestamps**: `created_at` and `updated_at` on all core tables

### Custom Domain Types

```sql
-- Email validation
CREATE DOMAIN email_address AS VARCHAR(255)
  CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Locale codes
CREATE DOMAIN locale_code AS VARCHAR(10)
  CHECK (VALUE IN ('ar-DZ', 'fr-FR', 'en-US'));

-- Timezone names
CREATE DOMAIN timezone_name AS VARCHAR(50)
  CHECK (VALUE ~ '^[A-Za-z_]+/[A-Za-z_]+$');
```

---

## Normalization

### First Normal Form (1NF)

✅ **All tables satisfy 1NF:**
- Atomic values only (no arrays or nested structures)
- No repeating groups
- Each row is unique (primary key)
- Column order is irrelevant

### Second Normal Form (2NF)

✅ **All tables satisfy 2NF:**
- All tables are in 1NF
- All non-key attributes are fully functionally dependent on the primary key
- No partial dependencies

**Example**: In `messages` table, all attributes depend on the entire primary key (`id`), not just part of it.

### Third Normal Form (3NF)

✅ **All tables satisfy 3NF:**
- All tables are in 2NF
- No transitive dependencies
- All non-key attributes depend only on the primary key

**Example**: User preferences are in a separate `user_preferences` table to eliminate transitive dependency through `user_id`.

### Strategic Denormalization

For performance optimization, we strategically denormalize:

| Table | Denormalized Field | Reason | Maintenance |
|-------|-------------------|--------|-------------|
| `conversations` | `message_count` | Avoid COUNT(*) queries | Trigger |
| `conversations` | `last_message_at` | Quick sorting | Trigger |
| `documents` | `chunk_count` | Quick statistics | Manual |

---

## Tables Reference

### 1. Users Table

**Purpose**: Store user accounts with authentication and profile information.

**Key Fields**:
- `id` (UUID): Primary key
- `email` (email_address): Unique email with validation
- `password_hash` (VARCHAR): Bcrypt hashed password
- `locale` (locale_code): User's preferred language
- `timezone` (timezone_name): User's timezone (default: Africa/Algiers)
- `consent_data_storage` (BOOLEAN): GDPR consent flag

**Constraints**:
```sql
CONSTRAINT chk_consent CHECK (
  (consent_data_storage = false) OR 
  (consent_data_storage = true AND consent_timestamp IS NOT NULL)
)
```

**Indexes**:
- `idx_users_email`: B-tree on email (partial: WHERE deleted_at IS NULL)
- `idx_users_active`: B-tree on is_active
- `idx_users_created_at`: B-tree on created_at DESC

**Sample Query**:
```sql
-- Get active users with recent activity
SELECT id, email, name, last_login_at
FROM users
WHERE is_active = true 
  AND deleted_at IS NULL
  AND last_login_at > NOW() - INTERVAL '30 days'
ORDER BY last_login_at DESC;
```

---

### 2. Conversations Table

**Purpose**: Store chat conversations between users and AI assistant.

**Key Fields**:
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `mode` (VARCHAR): Conversation mode (AUTO, RAG, SUPPORT)
- `status` (VARCHAR): Status (active, archived, escalated, closed)
- `message_count` (INTEGER): Cached message count (auto-updated)
- `last_message_at` (TIMESTAMPTZ): Last message timestamp

**Foreign Keys**:
```sql
user_id REFERENCES users(id) ON DELETE CASCADE
mode REFERENCES conversation_modes(code)
status REFERENCES conversation_statuses(code)
```

**Triggers**:
- `update_conversations_updated_at`: Auto-update `updated_at` on changes
- `trigger_update_conversation_message_count`: Update `message_count` when messages added/deleted

**Sample Query**:
```sql
-- Get user's active conversations with message counts
SELECT c.id, c.title, c.mode, c.message_count, c.last_message_at
FROM conversations c
WHERE c.user_id = 'user-uuid-here'
  AND c.archived_at IS NULL
ORDER BY c.last_message_at DESC
LIMIT 20;
```

---

### 3. Messages Table

**Purpose**: Store individual messages within conversations.

**Key Fields**:
- `id` (UUID): Primary key
- `conversation_id` (UUID): Foreign key to conversations
- `role` (VARCHAR): Message role (user, assistant, system)
- `content` (TEXT): Message content (max 10,000 chars)
- `metadata` (JSONB): Flexible metadata storage
- `tokens_used` (INTEGER): Token count for LLM calls
- `processing_time_ms` (INTEGER): Processing time

**Constraints**:
```sql
CHECK (role IN ('user', 'assistant', 'system'))
CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 10000)
CHECK (tokens_used IS NULL OR tokens_used > 0)
```

**Indexes**:
- `idx_messages_conversation_id`: B-tree on conversation_id
- `idx_messages_content_fts`: GIN index for full-text search (Arabic)

**Full-Text Search**:
```sql
-- Search messages in Arabic
SELECT id, content, created_at
FROM messages
WHERE to_tsvector('arabic', content) @@ to_tsquery('arabic', 'المخدرات')
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

---

### 4. Decision Logs Table

**Purpose**: Log AUTO mode decisions for analytics and debugging.

**Key Fields**:
- `id` (UUID): Primary key
- `conversation_id` (UUID): Foreign key to conversations
- `message_id` (UUID): Foreign key to messages
- `decision` (VARCHAR): Decision made (rag, support)
- `reason` (TEXT): Explanation in Arabic
- `confidence` (FLOAT): Confidence score (0-1)
- `model_used` (VARCHAR): LLM model name

**Sample Query**:
```sql
-- Decision analytics by day
SELECT 
  DATE_TRUNC('day', created_at) as date,
  decision,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence
FROM decision_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), decision
ORDER BY date DESC;
```

---

### 5. Documents Table (RAG)

**Purpose**: Store documents for RAG indexing.

**Key Fields**:
- `id` (UUID): Primary key
- `title` (VARCHAR): Document title
- `content` (TEXT): Full document content
- `content_hash` (VARCHAR): SHA-256 hash for deduplication
- `pii_stripped` (BOOLEAN): PII removal flag
- `review_status` (VARCHAR): Review status (pending, approved, rejected)
- `chunk_count` (INTEGER): Number of chunks

**Sample Query**:
```sql
-- Get approved documents ready for RAG
SELECT id, title, chunk_count, language
FROM documents
WHERE review_status = 'approved'
  AND pii_stripped = true
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

---

### 6. Document Chunks Table (RAG)

**Purpose**: Store document chunks with vector embeddings for semantic search.

**Key Fields**:
- `id` (UUID): Primary key
- `document_id` (UUID): Foreign key to documents
- `content` (TEXT): Chunk content
- `embedding` (vector(1536)): OpenAI ada-002 embedding
- `chunk_index` (INTEGER): Sequential chunk number

**Vector Search**:
```sql
-- Semantic similarity search
SELECT 
  dc.content,
  d.title,
  1 - (dc.embedding <=> $1::vector) as similarity
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE 1 - (dc.embedding <=> $1::vector) > 0.7
ORDER BY dc.embedding <=> $1::vector
LIMIT 5;
```

**Index**:
```sql
-- IVFFlat index for fast vector search
CREATE INDEX idx_document_chunks_embedding_ivfflat 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

---

### 7. Support Tickets Table

**Purpose**: Manage support tickets for human intervention.

**Key Fields**:
- `id` (UUID): Primary key
- `ticket_number` (VARCHAR): Human-readable (e.g., TKT-2025-000001)
- `user_id` (UUID): Foreign key to users
- `subject` (VARCHAR): Ticket subject
- `category` (VARCHAR): Category (addiction, mental_health, etc.)
- `priority` (VARCHAR): Priority (low, medium, high, urgent)
- `status` (VARCHAR): Status (open, in_progress, resolved, closed)
- `sla_due_at` (TIMESTAMPTZ): SLA deadline (auto-calculated)

**Triggers**:
- `trigger_generate_ticket_number`: Auto-generate ticket number
- `trigger_calculate_sla_due_date`: Calculate SLA based on priority

**Sample Query**:
```sql
-- Get open tickets with SLA breach risk
SELECT 
  ticket_number,
  subject,
  priority,
  sla_due_at,
  EXTRACT(EPOCH FROM (sla_due_at - NOW()))/3600 as hours_remaining
FROM support_tickets
WHERE status IN ('open', 'in_progress')
  AND sla_due_at < NOW() + INTERVAL '2 hours'
ORDER BY sla_due_at ASC;
```

---

## Indexes & Performance

### Index Strategy

| Index Type | Use Case | Example |
|------------|----------|---------|
| **B-tree** | Equality & range queries | `idx_users_email` |
| **GIN** | Full-text search, JSONB | `idx_messages_content_fts` |
| **IVFFlat** | Vector similarity | `idx_document_chunks_embedding_ivfflat` |
| **Partial** | Filtered queries | `WHERE deleted_at IS NULL` |
| **Composite** | Multi-column queries | `(user_id, updated_at DESC)` |

### Performance Monitoring

```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Optimization Tips

1. **Use EXPLAIN ANALYZE** for query planning
2. **Leverage partial indexes** for common WHERE clauses
3. **Implement connection pooling** (20 connections recommended)
4. **Cache frequently accessed data** in Redis
5. **Regular VACUUM and ANALYZE** (weekly recommended)

---

## Triggers & Functions

### Automated Triggers

#### 1. Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: users, conversations, documents, support_tickets
```

#### 2. Message Count Trigger

```sql
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations 
    SET message_count = GREATEST(message_count - 1, 0)
    WHERE id = OLD.conversation_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

#### 3. Ticket Number Generator

```sql
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_part VARCHAR(6);
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_part
  FROM support_tickets
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  NEW.ticket_number := 'TKT-' || year_part || '-' || sequence_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Utility Functions

#### 1. Archive Old Conversations

```sql
SELECT archive_old_conversations(90); -- Archive conversations older than 90 days
```

#### 2. Cleanup Expired Magic Links

```sql
SELECT cleanup_expired_magic_links(); -- Delete magic links older than 7 days
```

#### 3. Get Conversation Summary

```sql
SELECT * FROM get_conversation_summary('conversation-uuid-here');
```

---

## Views & Materialized Views

### 1. Active Conversations View

```sql
CREATE OR REPLACE VIEW v_active_conversations AS
SELECT 
  c.id,
  c.user_id,
  u.email,
  u.name,
  c.title,
  c.mode,
  c.status,
  c.message_count,
  c.last_message_at
FROM conversations c
JOIN users u ON c.user_id = u.id
WHERE c.archived_at IS NULL
  AND u.deleted_at IS NULL;
```

### 2. Ticket Statistics View

```sql
CREATE OR REPLACE VIEW v_ticket_statistics AS
SELECT 
  category,
  priority,
  status,
  COUNT(*) as ticket_count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))/3600) as avg_resolution_hours
FROM support_tickets
GROUP BY category, priority, status;
```

### 3. Daily Statistics (Materialized)

```sql
CREATE MATERIALIZED VIEW mv_daily_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  'users' as metric_type,
  COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
-- ... (union with other metrics)

-- Refresh daily
SELECT refresh_daily_statistics();
```

---

## Security

### Access Control

```sql
-- Application role (read/write)
CREATE ROLE amal_app WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE amal_chat TO amal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES TO amal_app;

-- Read-only role (analytics)
CREATE ROLE amal_readonly WITH LOGIN PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE amal_chat TO amal_readonly;
GRANT SELECT ON ALL TABLES TO amal_readonly;
```

### Data Protection

1. **Encryption at Rest**: Enable PostgreSQL encryption
2. **Encryption in Transit**: Use SSL/TLS connections
3. **Password Hashing**: Bcrypt with 10 rounds
4. **PII Protection**: Flag documents before indexing
5. **Audit Trail**: Comprehensive logging

### GDPR Compliance

- ✅ Consent tracking (`consent_data_storage`, `consent_timestamp`)
- ✅ Right to be forgotten (soft delete with `deleted_at`)
- ✅ Data portability (export functions)
- ✅ Audit trail (`audit_logs`)

---

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/var/backups/amal"
DATE=$(date +%Y%m%d_%H%M%S)

# Full backup
pg_dump -U amal_user -h localhost amal_chat | \
  gzip > $BACKUP_DIR/amal_db_$DATE.sql.gz

# Retain last 7 days
find $BACKUP_DIR -name "amal_db_*.sql.gz" -mtime +7 -delete
```

### Recovery

```bash
# Restore from backup
gunzip < /var/backups/amal/amal_db_20250115.sql.gz | \
  psql -U amal_user -h localhost amal_chat
```

**RTO (Recovery Time Objective)**: < 1 hour  
**RPO (Recovery Point Objective)**: < 6 hours

---

## Monitoring

### Health Checks

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('amal_chat'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Cache hit ratio (should be > 90%)
SELECT 
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 as cache_hit_ratio
FROM pg_statio_user_tables;
```

---

## Docker Setup

### Quick Start

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL with pgvector |
| redis | 6379 | Redis for sessions |
| backend | 3000 | Node.js API server |
| nginx | 80, 443 | Reverse proxy |
| pgadmin | 5050 | Database management (dev) |
| redis-commander | 8081 | Redis management (dev) |

### Environment Variables

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env
```

---

## Migration Guide

### Initial Setup

```bash
# 1. Start Docker services
docker-compose up -d postgres redis

# 2. Wait for PostgreSQL to be ready
docker-compose logs -f postgres

# 3. Run migrations
npm run migrate

# 4. Verify schema
docker-compose exec postgres psql -U amal_user -d amal_chat -c "\dt"
```

### Schema Updates

```bash
# 1. Create migration file
touch backend/src/db/migrations/002_add_new_feature.sql

# 2. Write migration SQL
# 3. Run migration
npm run migrate

# 4. Verify changes
docker-compose exec postgres psql -U amal_user -d amal_chat -c "\d table_name"
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart service
docker-compose restart postgres
```

#### 2. Slow Queries

```sql
-- Enable query logging
ALTER DATABASE amal_chat SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

#### 3. Disk Space

```bash
# Check database size
docker-compose exec postgres psql -U amal_user -d amal_chat -c "SELECT pg_size_pretty(pg_database_size('amal_chat'));"

# Vacuum to reclaim space
docker-compose exec postgres psql -U amal_user -d amal_chat -c "VACUUM FULL ANALYZE;"
```

---

## Contact & Support

- **Database Team**: dba@amal.dz
- **Support**: support@amal.dz
- **Documentation**: See `docs/database-documentation.pdf` (LaTeX compiled)
- **Schema Diagram**: See `docs/database-schema.md` (Mermaid diagrams)

---

**Version**: 2.0  
**Last Updated**: December 15, 2025  
**License**: MIT
