# Database Module

PostgreSQL database setup for Marriaged4Life.

## Setup

### 1. Install PostgreSQL

Download and install PostgreSQL 14+ from https://www.postgresql.org/download/

### 2. Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE married4life;

# Or using command line
createdb -U postgres married4life
```

### 3. Run Schema

```bash
psql -U postgres -d married4life -f schema.sql
```

Or use the initialization script:

```bash
cd database
node init.ts
```

## Schema Overview

### Tables

- **users** - User accounts and profiles
- **courses** - Course catalog
- **lessons** - Individual lessons within courses
- **user_progress** - User progress tracking
- **games** - Connection games and activities
- **ai_conversations** - AI coach conversation history
- **notification_preferences** - Push notification settings

## Connection String

Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

Example:
```
postgresql://postgres:password@localhost:5432/married4life
```

## Development

For local development, you can use environment variables or update the config in `backend/src/config.ts`.

## Production

For production, use a managed PostgreSQL service like:
- AWS RDS
- Heroku Postgres
- Supabase
- DigitalOcean Managed Database

## Migrations

Future database migrations will be tracked in this folder with versioned SQL files.

## Backup

Always backup your production database regularly:

```bash
pg_dump -U postgres married4life > backup.sql
```

Restore:

```bash
psql -U postgres married4life < backup.sql
```

