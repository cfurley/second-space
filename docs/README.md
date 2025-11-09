# ?? Second Space Documentation

Welcome to the Second Space documentation! This directory contains comprehensive guides for setting up and using the application.

---

## ?? Documentation Index

### ?? Quick Start
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference card with commands and queries
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete summary of recent implementations

### ?? Security & Authentication
- **[../DOCKER_TESTING_GUIDE.md](../DOCKER_TESTING_GUIDE.md)** - Password hashing testing guide
- **[../test-password-hashing.ps1](../test-password-hashing.ps1)** - Automated password test script

### ?? Database
- **[DBEAVER_SETUP.md](DBEAVER_SETUP.md)** - Complete DBeaver setup and SQL query guide
- **[../database/README.md](../database/README.md)** - Database schema documentation

### ?? AI Features
- **[AI_UPGRADE_GUIDE.md](AI_UPGRADE_GUIDE.md)** - GPT-4o upgrade guide with new features
- **[../ai-server/README.md](../ai-server/README.md)** - AI server API documentation

### ??? Architecture
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture overview
- **[../IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)** - Media routes & AI implementation

### ?? Project Management
- **[../REPOSITORY_REVIEW.md](../REPOSITORY_REVIEW.md)** - Complete repository review and status
- **[../README.md](../README.md)** - Main project README

---

## ?? Getting Started

### 1. Set Up Your Development Environment

```powershell
# Clone repository
git clone https://github.com/cfurley/second-space.git
cd second-space

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../ai-server && npm install

# Start with Docker
cd ..
docker-compose up --build
```

### 2. Install Database Tools

Follow the **[DBEAVER_SETUP.md](DBEAVER_SETUP.md)** guide to install and configure DBeaver for database management.

### 3. Configure AI Features

1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Copy `ai-server/.env.example` to `ai-server/.env`
3. Add your API key
4. Start AI server: `cd ai-server && npm start`

### 4. Test Everything

```powershell
# Test password hashing
.\test-password-hashing.ps1

# Test AI server
cd ai-server
npm start

# In another terminal:
curl -X POST http://localhost:8081/api/analyze/caption `
  -H "Content-Type: application/json" `
  -d '{"imageUrl":"https://picsum.photos/400","style":"poetic"}'
```

---

## ?? Documentation by Topic

### Security

**Password Hashing:**
- Implementation: `backend/src/services/userServices.js`
- Testing: `test-password-hashing.ps1`
- Verification: See DBEAVER_SETUP.md for SQL queries

**Best Practices:**
- ? Passwords hashed with bcrypt (10 salt rounds)
- ? One-way encryption (cannot be reversed)
- ? Secure comparison on login
- ? No passwords in logs or responses

### Database Management

**Tools:**
- **DBeaver** - Professional database management
- **psql** - Command-line interface
- **Docker exec** - Direct container access

**Common Tasks:**
```sql
-- Check password hashes
SELECT username, LEFT(password, 30) FROM "user";

-- View recent users
SELECT * FROM "user" 
WHERE create_date_utc > NOW() - INTERVAL '24 hours';

-- Count spaces by user
SELECT u.username, COUNT(s.id) 
FROM "user" u 
LEFT JOIN space s ON u.id = s.created_by_user_id 
GROUP BY u.username;
```

See **[DBEAVER_SETUP.md](DBEAVER_SETUP.md)** for more queries.

### AI Features

**Capabilities:**
1. **Image Analysis** - GPT-4o Vision analysis
2. **Caption Generation** - AI-generated captions
3. **Content Moderation** - Safety checks
4. **Tag Generation** - Auto-generate tags
5. **Recommendations** - Smart suggestions
6. **Organization** - Auto-categorize media

**Models:**
- **GPT-4o** - Image analysis, captions (50% cheaper)
- **GPT-4o-mini** - Tags, recommendations (90% cheaper)

**Cost Examples:**
- Image analysis: $0.005 per image
- Tag generation: $0.00002 per request
- Caption: $0.001 per caption

See **[AI_UPGRADE_GUIDE.md](AI_UPGRADE_GUIDE.md)** for details.

---

## ?? Learning Resources

### For Beginners

**1. Understanding the Architecture:**
- Read: [ARCHITECTURE.md](../ARCHITECTURE.md)
- Learn about: Frontend, Backend, Database, AI Server

**2. Database Basics:**
- Install: DBeaver ([DBEAVER_SETUP.md](DBEAVER_SETUP.md))
- Practice: Run sample SQL queries
- Learn: PostgreSQL basics

**3. API Testing:**
- Tool: Postman or curl
- Guide: Test endpoints in QUICK_REFERENCE.md
- Practice: Make API calls

### For Intermediate

**1. Implementing Features:**
- Study: [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)
- Learn: Media routes implementation
- Practice: Add new endpoints

**2. AI Integration:**
- Setup: Configure OpenAI API
- Study: [AI_UPGRADE_GUIDE.md](AI_UPGRADE_GUIDE.md)
- Practice: Use AI endpoints

**3. Security:**
- Learn: Password hashing with bcrypt
- Test: Run password hashing tests
- Understand: One-way encryption

### For Advanced

**1. System Architecture:**
- Design: Microservices pattern
- Scale: Load balancing, caching
- Deploy: Production deployment

**2. AI Optimization:**
- Cost: Token tracking and optimization
- Performance: Batch processing
- Features: Custom AI prompts

**3. Testing:**
- Unit: Component tests
- Integration: API tests
- E2E: Full application tests

---

## ?? Common Tasks

### Start Development Environment

```powershell
# Option 1: Docker (Recommended)
docker-compose up

# Option 2: Manual
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - AI Server
cd ai-server && npm start

# Terminal 3 - Frontend
cd frontend && npm run dev
```

### Connect to Database

```powershell
# Option 1: DBeaver (GUI)
# Follow DBEAVER_SETUP.md

# Option 2: Command Line
docker exec -it second-space-database psql -U myuser -d mydatabase

# Option 3: VS Code Extension
# Install PostgreSQL extension
```

### Test API Endpoints

```powershell
# Health check
curl http://localhost:8080/

# Create user
curl -X POST http://localhost:8080/user `
  -H "Content-Type: application/json" `
  -d '{"username":"test","password":"Test123!","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8080/user/authentication `
  -H "Content-Type: application/json" `
  -d '{"username":"test","password":"Test123!"}'
```

### Test AI Features

```powershell
# Analyze image
curl -X POST http://localhost:8081/api/analyze/image `
  -H "Content-Type: application/json" `
  -d '{"imageUrl":"https://picsum.photos/400"}'

# Generate caption
curl -X POST http://localhost:8081/api/analyze/caption `
  -H "Content-Type: application/json" `
  -d '{"imageUrl":"https://picsum.photos/400","style":"poetic"}'

# Moderate content
curl -X POST http://localhost:8081/api/analyze/moderate `
  -H "Content-Type: application/json" `
  -d '{"imageUrl":"https://picsum.photos/400"}'
```

---

## ?? Project Status

### Completed ?
- ? Password hashing implementation
- ? Media management system
- ? AI server with GPT-4o
- ? DBeaver database tools
- ? Comprehensive documentation

### In Progress ??
- ?? User CRUD operations (updateUser, deleteUser)
- ?? Frontend component cleanup
- ?? Test coverage increase

### Planned ??
- ?? API documentation (Swagger)
- ?? Deployment guide
- ?? Contributing guidelines

See **[REPOSITORY_REVIEW.md](../REPOSITORY_REVIEW.md)** for details.

---

## ?? Troubleshooting

### Can't Connect to Database

```powershell
# Check if container is running
docker ps

# Check logs
docker logs second-space-database

# Restart container
docker restart second-space-database

# Test connection
docker exec -it second-space-database psql -U myuser -d mydatabase
```

### AI Server Errors

```powershell
# Check API key
cat ai-server/.env

# Reinstall dependencies
cd ai-server
rm -rf node_modules
npm install

# Check logs
npm start
# Look for error messages
```

### Backend Won't Start

```powershell
# Check port availability
netstat -ano | findstr :8080

# Check dependencies
cd backend
npm install

# Check database connection
# Ensure database container is running
```

---

## ?? Getting Help

### Documentation
- Check relevant guide in this directory
- Read QUICK_REFERENCE.md for quick answers

### Online Resources
- **PostgreSQL:** https://www.postgresql.org/docs/
- **OpenAI API:** https://platform.openai.com/docs
- **DBeaver:** https://dbeaver.com/docs/
- **React:** https://react.dev/

### Community
- GitHub Issues: https://github.com/cfurley/second-space/issues
- Stack Overflow: Tag with `second-space`

---

## ?? Next Steps

### For New Developers

1. **Setup Environment:**
   - Install Docker Desktop
   - Clone repository
   - Run `docker-compose up`

2. **Explore Database:**
   - Install DBeaver
   - Connect to database
   - Run sample queries

3. **Test APIs:**
   - Install Postman
   - Test backend endpoints
   - Test AI endpoints

### For Contributors

1. **Read Documentation:**
   - Architecture overview
   - Implementation guides
   - Repository review

2. **Set Up Development:**
   - Install dependencies
   - Configure environment
   - Run tests

3. **Start Contributing:**
   - Pick an issue
   - Create a branch
   - Submit a PR

---

## ?? Documentation Updates

**Last Updated:** January 2025

**Recent Changes:**
- Added DBeaver setup guide
- Added AI upgrade guide
- Updated repository review
- Added quick reference
- Added implementation summary

**Contributors:**
- AI Code Review Assistant
- Caleb Furley (cfurley)

---

## ?? Summary

This documentation covers:
- ? Complete setup guides
- ? Security best practices
- ? Database management
- ? AI feature integration
- ? Troubleshooting
- ? Quick references

**Everything you need to develop Second Space!**

---

**Happy coding!** ??

For questions or suggestions, open an issue on GitHub.
