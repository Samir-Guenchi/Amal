# Amal Chat Platform - Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ conversations : "has many"
    users ||--o{ support_tickets : "creates"
    users ||--o{ user_sessions : "has"
    users ||--o{ audit_logs : "generates"
    users ||--o{ ticket_comments : "writes"
    users ||--o{ user_preferences : "has one"
    
    conversations ||--o{ messages : "contains"
    conversations ||--o{ decision_logs : "has"
    conversations ||--o| support_tickets : "escalates to"
    
    messages ||--o{ decision_logs : "triggers"
    
    documents ||--o{ document_chunks : "split into"
    
    support_tickets ||--o{ ticket_comments : "has"
    
    conversation_modes ||--o{ conversations : "defines"
    conversation_statuses ||--o{ conversations : "defines"
    ticket_categories ||--o{ support_tickets : "categorizes"
    ticket_priorities ||--o{ support_tickets : "prioritizes"
    ticket_statuses ||--o{ support_tickets : "tracks"
    
    users {
        uuid id PK
        email_address email UK
        varchar password_hash
        varchar name
        locale_code locale
        timezone_name timezone
        boolean consent_data_storage
        timestamptz consent_timestamp
        inet consent_ip_address
        boolean is_active
        boolean is_verified
        timestamptz email_verified_at
        integer failed_login_attempts
        timestamptz locked_until
        timestamptz last_login_at
        inet last_login_ip
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    
    user_preferences {
        uuid user_id PK,FK
        varchar theme
        boolean notifications_enabled
        boolean email_notifications
        locale_code language_preference
        boolean accessibility_mode
        timestamptz created_at
        timestamptz updated_at
    }
    
    conversations {
        uuid id PK
        uuid user_id FK
        varchar title
        varchar mode FK
        varchar status FK
        integer message_count
        timestamptz last_message_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz archived_at
    }
    
    messages {
        uuid id PK
        uuid conversation_id FK
        varchar role
        text content
        jsonb metadata
        integer tokens_used
        integer processing_time_ms
        timestamptz created_at
        timestamptz edited_at
        timestamptz deleted_at
    }
    
    decision_logs {
        uuid id PK
        uuid conversation_id FK
        uuid message_id FK
        varchar decision
        text reason
        float confidence
        varchar model_used
        integer prompt_tokens
        integer completion_tokens
        timestamptz created_at
    }
    
    documents {
        uuid id PK
        varchar title
        text content
        varchar content_hash UK
        jsonb metadata
        varchar source
        varchar author
        locale_code language
        boolean pii_stripped
        varchar review_status
        uuid reviewed_by FK
        timestamptz reviewed_at
        integer chunk_count
        integer total_tokens
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    
    document_chunks {
        uuid id PK
        uuid document_id FK
        text content
        vector_1536 embedding
        integer chunk_index
        jsonb metadata
        integer token_count
        integer start_position
        integer end_position
        timestamptz created_at
    }
    
    support_tickets {
        uuid id PK
        varchar ticket_number UK
        uuid conversation_id FK
        uuid user_id FK
        varchar subject
        varchar category FK
        varchar priority FK
        varchar status FK
        uuid assigned_to FK
        timestamptz assigned_at
        boolean escalated
        text escalation_reason
        timestamptz escalated_at
        uuid escalated_by FK
        timestamptz sla_due_at
        boolean sla_breached
        text resolution_notes
        uuid resolved_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz resolved_at
        timestamptz closed_at
    }
    
    ticket_comments {
        uuid id PK
        uuid ticket_id FK
        uuid user_id FK
        text content
        boolean is_internal
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    
    audit_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar resource_type
        uuid resource_id
        jsonb details
        inet ip_address
        text user_agent
        integer status_code
        text error_message
        timestamptz created_at
    }
    
    user_sessions {
        uuid id PK
        uuid user_id FK
        varchar refresh_token_hash
        inet ip_address
        text user_agent
        jsonb device_info
        timestamptz created_at
        timestamptz last_activity_at
        timestamptz expires_at
        timestamptz revoked_at
    }
    
    magic_links {
        uuid id PK
        email_address email
        varchar token UK
        timestamptz expires_at
        boolean used
        timestamptz used_at
        inet ip_address
        text user_agent
        timestamptz created_at
    }
    
    conversation_modes {
        varchar code PK
        varchar name_ar
        varchar name_fr
        varchar name_en
        text description
        boolean is_active
        timestamptz created_at
    }
    
    conversation_statuses {
        varchar code PK
        varchar name_ar
        varchar name_fr
        varchar name_en
        text description
        boolean is_terminal
        timestamptz created_at
    }
    
    ticket_categories {
        varchar code PK
        varchar name_ar
        varchar name_fr
        varchar name_en
        text description
        varchar icon
        integer sort_order
        boolean is_active
        timestamptz created_at
    }
    
    ticket_priorities {
        varchar code PK
        varchar name_ar
        varchar name_fr
        varchar name_en
        integer level UK
        varchar color
        integer sla_hours
        timestamptz created_at
    }
    
    ticket_statuses {
        varchar code PK
        varchar name_ar
        varchar name_fr
        varchar name_en
        boolean is_open
        boolean is_terminal
        timestamptz created_at
    }
```

## Database Architecture Diagram

```mermaid
graph TB
    subgraph "User Management"
        U[users]
        UP[user_preferences]
        US[user_sessions]
        ML[magic_links]
    end
    
    subgraph "Conversation System"
        C[conversations]
        M[messages]
        DL[decision_logs]
        CM[conversation_modes]
        CS[conversation_statuses]
    end
    
    subgraph "RAG System"
        D[documents]
        DC[document_chunks]
    end
    
    subgraph "Support System"
        ST[support_tickets]
        TC[ticket_comments]
        TCA[ticket_categories]
        TP[ticket_priorities]
        TS[ticket_statuses]
    end
    
    subgraph "Audit & Security"
        AL[audit_logs]
    end
    
    U --> C
    U --> ST
    U --> US
    U --> AL
    U --> UP
    
    C --> M
    C --> DL
    C --> ST
    
    M --> DL
    
    D --> DC
    
    ST --> TC
    
    CM --> C
    CS --> C
    TCA --> ST
    TP --> ST
    TS --> ST
    
    style U fill:#00b894
    style C fill:#0984e3
    style D fill:#6c5ce7
    style ST fill:#fd7e14
    style AL fill:#d63031
```

## Data Flow Diagram

```mermaid
flowchart LR
    User[User] -->|Authenticates| Auth[Authentication]
    Auth -->|Creates Session| Session[user_sessions]
    Auth -->|Logs| Audit[audit_logs]
    
    User -->|Sends Message| Chat[Chat System]
    Chat -->|Stores| Conv[conversations]
    Conv -->|Contains| Msg[messages]
    
    Chat -->|AUTO Mode| Decision{Decision Engine}
    Decision -->|RAG| RAG[RAG System]
    Decision -->|SUPPORT| Support[Support System]
    Decision -->|Logs| DecLog[decision_logs]
    
    RAG -->|Searches| Docs[documents]
    Docs -->|Chunks| Chunks[document_chunks]
    Chunks -->|Vector Search| Embedding[(pgvector)]
    
    Support -->|Creates| Ticket[support_tickets]
    Ticket -->|Comments| Comments[ticket_comments]
    
    style Decision fill:#ffd700
    style RAG fill:#6c5ce7
    style Support fill:#fd7e14
    style Embedding fill:#00b894
```

## Normalization Diagram

```mermaid
graph TD
    subgraph "3NF - Third Normal Form"
        A[All tables in 2NF]
        B[No transitive dependencies]
        C[Non-key attributes depend only on PK]
    end
    
    subgraph "2NF - Second Normal Form"
        D[All tables in 1NF]
        E[No partial dependencies]
        F[All non-key attributes fully dependent on PK]
    end
    
    subgraph "1NF - First Normal Form"
        G[Atomic values only]
        H[No repeating groups]
        I[Each row unique]
        J[Column order irrelevant]
    end
    
    G --> D
    H --> D
    I --> D
    J --> D
    
    D --> A
    E --> A
    F --> A
    
    A --> B
    B --> C
    
    style A fill:#00b894
    style D fill:#0984e3
    style G fill:#6c5ce7
```

## Index Strategy Diagram

```mermaid
graph LR
    subgraph "Index Types"
        BT[B-tree Indexes]
        GIN[GIN Indexes]
        IVF[IVFFlat Indexes]
        PART[Partial Indexes]
        COMP[Composite Indexes]
    end
    
    BT -->|Equality & Range| Q1[Standard Queries]
    GIN -->|Full-text| Q2[Text Search]
    IVF -->|Vector| Q3[Similarity Search]
    PART -->|Filtered| Q4[Conditional Queries]
    COMP -->|Multi-column| Q5[Complex Queries]
    
    Q1 --> Perf[Performance]
    Q2 --> Perf
    Q3 --> Perf
    Q4 --> Perf
    Q5 --> Perf
    
    style Perf fill:#00b894
```

## Security Layers Diagram

```mermaid
graph TB
    subgraph "Application Layer"
        APP[Application]
    end
    
    subgraph "Security Layers"
        AUTH[Authentication]
        AUTHZ[Authorization]
        VALID[Input Validation]
        ENCRYPT[Encryption]
        AUDIT[Audit Logging]
    end
    
    subgraph "Database Layer"
        ROLES[Role-Based Access]
        RLS[Row Level Security]
        SSL[SSL/TLS]
        BACKUP[Encrypted Backups]
    end
    
    APP --> AUTH
    AUTH --> AUTHZ
    AUTHZ --> VALID
    VALID --> ENCRYPT
    ENCRYPT --> AUDIT
    
    AUDIT --> ROLES
    ROLES --> RLS
    RLS --> SSL
    SSL --> BACKUP
    
    style AUTH fill:#00b894
    style ENCRYPT fill:#0984e3
    style BACKUP fill:#6c5ce7
```

## Backup Strategy Diagram

```mermaid
graph LR
    DB[(Database)] -->|Daily Full| FULL[Full Backup]
    DB -->|6h Incremental| INC[WAL Archive]
    
    FULL -->|7 days| LOCAL[Local Storage]
    INC -->|7 days| LOCAL
    
    LOCAL -->|30 days| OFFSITE[Offsite Storage]
    
    OFFSITE -->|Restore| RECOVERY[Recovery]
    
    style DB fill:#00b894
    style FULL fill:#0984e3
    style OFFSITE fill:#6c5ce7
    style RECOVERY fill:#fd7e14
```

## Performance Optimization Flow

```mermaid
flowchart TD
    START[Query Request] --> POOL[Connection Pool]
    POOL --> CACHE{Redis Cache?}
    CACHE -->|Hit| RETURN[Return Cached]
    CACHE -->|Miss| QUERY[Execute Query]
    
    QUERY --> INDEX{Index Available?}
    INDEX -->|Yes| FAST[Fast Index Scan]
    INDEX -->|No| SLOW[Sequential Scan]
    
    FAST --> RESULT[Query Result]
    SLOW --> RESULT
    
    RESULT --> STORE[Store in Cache]
    STORE --> RETURN
    
    style CACHE fill:#ffd700
    style FAST fill:#00b894
    style SLOW fill:#d63031
```
