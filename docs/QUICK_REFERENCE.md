# ?? Quick Reference - DBeaver & AI Server

## DBeaver Connection

```
Host:     localhost
Port:     5432
Database: mydatabase
Username: myuser
Password: mypassword
```

**Test Connection:** Right-click database ? Execute SQL Script

---

## Useful SQL Queries

### Check Password Hashing
```sql
SELECT username, 
       LEFT(password, 30) as hash,
       CASE WHEN password LIKE '$2b$%' 
            THEN '?' ELSE '?' END as status
FROM "user";
```

### View Recent Users
```sql
SELECT * FROM "user" 
WHERE create_date_utc > NOW() - INTERVAL '24 hours'
ORDER BY create_date_utc DESC;
```

### Count Spaces by User
```sql
SELECT u.username, COUNT(s.id) as spaces
FROM "user" u
LEFT JOIN space s ON u.id = s.created_by_user_id
WHERE u.deleted = 0
GROUP BY u.username;
```

---

## AI Server Endpoints

**Base URL:** `http://localhost:8081`

### Image Analysis
```http
POST /api/analyze/image
{
  "imageUrl": "https://example.com/image.jpg",
  "model": "gpt-4o",
  "detail": "high"
}
```

### Caption Generation
```http
POST /api/analyze/caption
{
  "imageUrl": "https://example.com/image.jpg",
  "style": "poetic",
  "length": "medium"
}
```

### Content Moderation
```http
POST /api/analyze/moderate
{
  "imageUrl": "https://example.com/image.jpg"
}
```

### Tag Generation
```http
POST /api/analyze/tags
{
  "text": "A beautiful sunset",
  "count": 10,
  "model": "gpt-4o-mini"
}
```

### Recommendations
```http
POST /api/recommendations/similar
{
  "tags": ["fitness", "health"],
  "type": "spaces",
  "count": 5
}
```

### Auto-Organization
```http
POST /api/organize/auto
{
  "mediaItems": [
    {"description": "Beach photo"},
    {"description": "Mountain hike"}
  ]
}
```

---

## Model Selection

| Task | Best Model | Cost/1K tokens |
|------|-----------|----------------|
| Image Analysis | gpt-4o | $0.005 input, $0.015 output |
| Captions | gpt-4o | $0.005 input, $0.015 output |
| Tags | gpt-4o-mini | $0.00015 input, $0.0006 output |
| Recommendations | gpt-4o-mini | $0.00015 input, $0.0006 output |

---

## Cost Calculator

```javascript
function calculateCost(tokens, model) {
  const prices = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
  };
  
  const p = prices[model];
  return ((tokens.input * p.input) + (tokens.output * p.output)) / 1000;
}

// Example:
calculateCost({ input: 150, output: 200 }, 'gpt-4o');
// Result: $0.0038
```

---

## Common Issues

### DBeaver:
**Issue:** Connection refused  
**Fix:** `docker ps` ? Check if database container is running

**Issue:** Authentication failed  
**Fix:** Verify credentials in docker-compose.yaml

### AI Server:
**Issue:** API key not configured  
**Fix:** Add `OPENAI_API_KEY` to `.env` file

**Issue:** Module not found  
**Fix:** `cd ai-server && npm install`

---

## Quick Tests

### Test Password Hashing (Docker)
```powershell
docker exec -it second-space-database psql -U myuser -d mydatabase -c "SELECT username, LEFT(password, 30) FROM \"user\";"
```

### Test AI Server (PowerShell)
```powershell
curl -X POST http://localhost:8081/api/analyze/caption `
  -H "Content-Type: application/json" `
  -d '{"imageUrl":"https://picsum.photos/400","style":"poetic"}'
```

---

## Keyboard Shortcuts

### DBeaver:
- `Ctrl + Enter` - Execute SQL
- `Ctrl + Shift + F` - Format SQL
- `Ctrl + F` - Find in results
- `Ctrl + Shift + E` - Export results

---

## File Locations

```
docs/
??? DBEAVER_SETUP.md         # Full DBeaver guide
??? AI_UPGRADE_GUIDE.md      # AI upgrade details
??? IMPLEMENTATION_SUMMARY.md # Complete summary
```

---

## Support

- **DBeaver Docs:** https://dbeaver.com/docs/
- **OpenAI API:** https://platform.openai.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

---

**Print this page for quick reference!** ??
