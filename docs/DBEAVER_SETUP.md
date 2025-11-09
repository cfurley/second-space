# ?? DBeaver Setup Guide - Second Space

## Quick Setup

### 1. Install DBeaver Community Edition

**Download:** https://dbeaver.io/download/

**Or use package manager:**
```powershell
# Chocolatey
choco install dbeaver

# Winget
winget install dbeaver.dbeaver
```

---

## 2. Connect to Second Space Database

### Connection Details

| Field | Value |
|-------|-------|
| **Host** | localhost |
| **Port** | 5432 |
| **Database** | mydatabase |
| **Username** | myuser |
| **Password** | mypassword |

### Step-by-Step Connection

1. **Open DBeaver** ? Click "New Database Connection" (plug icon)

2. **Select PostgreSQL**
   - In the list, find and click **PostgreSQL**
   - Click **Next**

3. **Enter Connection Settings:**
   ```
   Host: localhost
   Port: 5432
   Database: mydatabase
   Username: myuser
   Password: mypassword
   ```

4. **Test Connection**
   - Click **Test Connection**
   - If prompted, click **Download** to install PostgreSQL JDBC driver
   - You should see: ? "Connected"

5. **Save Connection**
   - Click **Finish**
   - Your database now appears in the left sidebar

---

## 3. Useful Queries for Development

### Check Password Hashing

```sql
-- Verify all passwords are hashed
SELECT 
    id,
    username,
    LEFT(password, 30) as password_preview,
    LENGTH(password) as password_length,
    CASE 
        WHEN password LIKE '$2b$%' THEN '? Hashed'
        WHEN password LIKE '$2a$%' THEN '? Hashed (old bcrypt)'
        ELSE '? Plain Text'
    END as status
FROM "user"
ORDER BY create_date_utc DESC;
```

### View Recent Users

```sql
-- Get users created in last 24 hours
SELECT 
    id,
    username,
    first_name,
    last_name,
    create_date_utc,
    last_login_date_utc
FROM "user"
WHERE create_date_utc > NOW() - INTERVAL '24 hours'
  AND deleted = 0
ORDER BY create_date_utc DESC;
```

### Check Spaces by User

```sql
-- See all spaces grouped by user
SELECT 
    u.username,
    COUNT(s.id) as total_spaces,
    MAX(s.create_date_utc) as last_created
FROM "user" u
LEFT JOIN space s ON u.id = s.created_by_user_id
WHERE u.deleted = 0 AND (s.deleted = 0 OR s.deleted IS NULL)
GROUP BY u.username
ORDER BY total_spaces DESC;
```

### Find Orphaned Data

```sql
-- Find spaces without a valid user
SELECT s.* 
FROM space s
LEFT JOIN "user" u ON s.created_by_user_id = u.id
WHERE u.id IS NULL;
```

### Database Statistics

```sql
-- Get table sizes and row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_stat_get_live_tuples(tablename::regclass) AS row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 4. DBeaver Pro Tips

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Execute SQL | `Ctrl + Enter` |
| Format SQL | `Ctrl + Shift + F` |
| Show ER Diagram | `Ctrl + Alt + D` |
| Find in results | `Ctrl + F` |
| Export results | `Ctrl + Shift + E` |

### Enable Auto-Complete

1. Go to **Window** ? **Preferences**
2. Navigate to **Editors** ? **SQL Editor** ? **Code Completion**
3. Check:
   - ? Enable auto activation
   - ? Use server-side object name case
   - ? Insert space after table name

### View ER Diagram

1. Right-click on your database in the tree
2. Select **View Diagram**
3. Drag tables onto the canvas
4. DBeaver will show relationships automatically!

### Export Query Results

1. Run your query
2. Right-click on results
3. **Export Data** ? Choose format:
   - CSV
   - JSON
   - SQL (INSERT statements)
   - Excel
   - HTML

---

## 5. Useful SQL Scripts

### Create Test Data

```sql
-- Create a test user (password: TestPass123!)
INSERT INTO "user" (username, password, first_name, last_name, display_name, create_date_utc, last_login_date_utc)
VALUES (
    'testuser',
    '$2b$10$abcdefghijklmnopqrstuvwxyz123456',  -- Replace with actual hash
    'Test',
    'User',
    'testuser',
    NOW(),
    NOW()
);

-- Create a test space
INSERT INTO space (created_by_user_id, title, icon, create_date_utc)
VALUES (
    (SELECT id FROM "user" WHERE username = 'testuser'),
    'Test Space',
    '??',
    NOW()
);
```

### Clean Up Test Data

```sql
-- Soft delete test users
UPDATE "user" 
SET deleted = 1, delete_date_utc = NOW()
WHERE username LIKE 'test%';

-- Soft delete test spaces
UPDATE space 
SET deleted = 1, delete_date_utc = NOW()
WHERE title LIKE 'Test%';
```

### Reset Auto-Increment Sequences

```sql
-- Reset user ID sequence
SELECT setval(pg_get_serial_sequence('"user"', 'id'), 
    COALESCE((SELECT MAX(id) FROM "user"), 1), false);

-- Reset space ID sequence
SELECT setval(pg_get_serial_sequence('space', 'id'), 
    COALESCE((SELECT MAX(id) FROM space), 1), false);
```

---

## 6. Database Maintenance

### Vacuum Database (Clean up)

```sql
-- Analyze and vacuum all tables
VACUUM ANALYZE;

-- Vacuum specific table
VACUUM ANALYZE "user";
```

### Check Database Size

```sql
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'mydatabase';
```

### View Active Connections

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 50) as query_preview
FROM pg_stat_activity
WHERE datname = 'mydatabase'
ORDER BY query_start DESC;
```

---

## 7. Backup & Restore

### Backup Database

```powershell
# Using Docker
docker exec second-space-database pg_dump -U myuser mydatabase > backup.sql

# Restore backup
docker exec -i second-space-database psql -U myuser mydatabase < backup.sql
```

### Backup Specific Tables

```powershell
# Backup users and spaces only
docker exec second-space-database pg_dump -U myuser -t '"user"' -t space mydatabase > user_space_backup.sql
```

---

## 8. Troubleshooting

### "Connection refused"

```powershell
# Check if database container is running
docker ps | Select-String "postgres"

# Check logs
docker logs second-space-database

# Restart container
docker restart second-space-database
```

### "Authentication failed"

- Double-check username and password in DBeaver
- Verify credentials in `docker-compose.yaml`
- Try connecting via command line first:
  ```powershell
  docker exec -it second-space-database psql -U myuser -d mydatabase
  ```

### "Database does not exist"

```powershell
# List all databases in container
docker exec second-space-database psql -U myuser -l

# Create database if missing
docker exec second-space-database createdb -U myuser mydatabase
```

---

## 9. Security Best Practices

### ?? Never Commit Real Passwords

```sql
-- ? BAD - Don't put real passwords in SQL files
INSERT INTO "user" (username, password) 
VALUES ('admin', 'admin123');

-- ? GOOD - Use bcrypt hashes
INSERT INTO "user" (username, password) 
VALUES ('admin', '$2b$10$...');
```

### Use Prepared Statements

```sql
-- In DBeaver, use variables
-- Go to SQL Editor ? Variables (?)
-- Define: @username = 'testuser'

SELECT * FROM "user" WHERE username = @username;
```

---

## 10. DBeaver Extensions

### Install Useful Extensions

1. **Dark Theme:** Window ? Preferences ? Appearance ? Theme
2. **SQL Formatter:** Window ? Preferences ? SQL Editor ? Formatting
3. **Git Integration:** Help ? Install New Software ? Git

---

## ?? Quick Reference

| Task | Location |
|------|----------|
| **Execute Query** | SQL Editor ? Ctrl+Enter |
| **View Data** | Right-click table ? View Data |
| **Edit Data** | Double-click in result grid |
| **ER Diagram** | Right-click DB ? View Diagram |
| **Export** | Right-click results ? Export Data |
| **Import** | Right-click table ? Import Data |

---

## ?? Additional Resources

- [DBeaver Documentation](https://dbeaver.com/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.postgresqltutorial.com/)

---

**Setup Complete!** ??

You now have professional database management tools at your fingertips!
