# Database Docker Setup

## Quick Start

### 1. Configure Environment

```bash
cd database
cp .env.example .env
# Edit .env with your passwords
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis only
docker-compose up -d

# Or start with development tools (pgAdmin, Redis Commander)
docker-compose --profile dev up -d
```

### 3. Verify Installation

```bash
# Check services
docker-compose ps

# Check database health
docker exec amal-postgres pg_isready -U amal_user -d amal_chat

# View logs
docker-compose logs -f postgres
```

## Services

| Service | Port | Description | Profile |
|---------|------|-------------|---------|
| **postgres** | 5432 | PostgreSQL 14+ with pgvector | default |
| **redis** | 6379 | Redis for sessions/caching | default |
| **pgadmin** | 5050 | Database management UI | dev |
| **redis-commander** | 8081 | Redis management UI | dev |

## Database Initialization

The database is automatically initialized on first run with:

1. **Schema files** (`schema/*.sql`) - Executed in order (00-08)
2. **Seed data** (`seeds/*.sql`) - Reference data loaded
3. **Init script** (`scripts/init-db.sh`) - Orchestrates setup

### Manual Initialization

If you need to reinitialize:

```bash
# Stop and remove containers
docker-compose down -v

# Start fresh
docker-compose up -d

# Or run schema manually
docker exec -i amal-postgres psql -U amal_user -d amal_chat < schema/00-extensions.sql
# ... continue with other files
```

## Common Commands

### Start/Stop

```bash
# Start all services
docker-compose up -d

# Start with dev tools
docker-compose --profile dev up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Database Access

```bash
# Connect to database
docker exec -it amal-postgres psql -U amal_user -d amal_chat

# Run SQL file
docker exec -i amal-postgres psql -U amal_user -d amal_chat < myfile.sql

# Backup database
docker exec amal-postgres pg_dump -U amal_user amal_chat | gzip > backup.sql.gz

# Restore database
gunzip < backup.sql.gz | docker exec -i amal-postgres psql -U amal_user -d amal_chat
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 postgres
```

### Health Checks

```bash
# Check PostgreSQL
docker exec amal-postgres pg_isready -U amal_user -d amal_chat

# Check Redis
docker exec amal-redis redis-cli -a ${REDIS_PASSWORD} ping

# Check all services
docker-compose ps
```

## Maintenance

### Backup

```bash
# Using script
./scripts/backup.sh

# Or manually
docker exec amal-postgres pg_dump -U amal_user amal_chat | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# Using script
./scripts/restore.sh backup.sql.gz

# Or manually
gunzip < backup.sql.gz | docker exec -i amal-postgres psql -U amal_user -d amal_chat
```

### Health Check

```bash
./scripts/health-check.sh
```

### Maintenance Tasks

```bash
# Run all maintenance
./scripts/maintenance.sh all

# Specific tasks
./scripts/maintenance.sh vacuum
./scripts/maintenance.sh cleanup
./scripts/maintenance.sh refresh
```

## Development Tools

### pgAdmin (Port 5050)

1. Start with dev profile: `docker-compose --profile dev up -d`
2. Open: http://localhost:5050
3. Login with credentials from `.env`
4. Add server:
   - Host: postgres
   - Port: 5432
   - Database: amal_chat
   - Username: amal_user
   - Password: (from .env)

### Redis Commander (Port 8081)

1. Start with dev profile: `docker-compose --profile dev up -d`
2. Open: http://localhost:8081
3. No login required

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs postgres

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database connection issues

```bash
# Check if PostgreSQL is ready
docker exec amal-postgres pg_isready

# Check network
docker network inspect database_amal-network

# Test connection
docker exec amal-postgres psql -U amal_user -d amal_chat -c "SELECT 1;"
```

### Reset everything

```bash
# ⚠️ WARNING: This deletes all data!
docker-compose down -v
docker-compose up -d
```

## Environment Variables

### Required

```bash
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password
```

### Optional (Dev Tools)

```bash
PGADMIN_EMAIL=admin@amal.dz
PGADMIN_PASSWORD=admin_password
```

## Volumes

| Volume | Purpose | Location |
|--------|---------|----------|
| `postgres_data` | Database files | `/var/lib/postgresql/data` |
| `redis_data` | Redis persistence | `/data` |
| `pgadmin_data` | pgAdmin settings | `/var/lib/pgadmin` |

## Network

All services are connected via `amal-network` bridge network.

## Security Notes

1. **Change default passwords** in `.env`
2. **Don't commit** `.env` to version control
3. **Use strong passwords** (16+ characters)
4. **Limit port exposure** in production
5. **Enable SSL/TLS** for production
6. **Regular backups** are essential

## Production Deployment

For production:

1. Use strong passwords
2. Enable SSL/TLS
3. Configure firewall rules
4. Set up automated backups
5. Monitor with health checks
6. Use secrets management
7. Limit network exposure

See main [DEPLOYMENT.md](../DEPLOYMENT.md) for details.

---

**Version**: 2.0  
**Last Updated**: December 15, 2025  
**Status**: Production Ready ✅
