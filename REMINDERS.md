# ⚠️ IMPORTANT REMINDERS - Second Space Project

## 🔐 Security Issues to Fix IMMEDIATELY

### 1. **Hardcoded Database Credentials** ❌

**Files affected:**

- `docker-compose.yaml` (lines 14-16, 34-36)
- `.env.example` files (need to create actual .env files)

**Current problem:**

```yaml
# docker-compose.yaml
environment:
  - POSTGRES_USER=myuser # ❌ Hardcoded
  - POSTGRES_PASSWORD=mypassword # ❌ Hardcoded - SECURITY RISK!
  - POSTGRES_DB=mydatabase # ❌ Hardcoded
```

**How to fix:**

```bash
# 1. Create backend/.env file (DON'T COMMIT THIS!)
cd backend
cp .env.example .env

# 2. Edit backend/.env with your values
DB_HOST=database
DB_PORT=5432
DB_USER=your_secure_username
DB_PASSWORD=your_strong_password_here
DB_NAME=second_space_db

# 3. Update docker-compose.yaml to use .env file
# Change to:
environment:
  - DB_USER=${DB_USER}
  - DB_PASSWORD=${DB_PASSWORD}
  - DB_NAME=${DB_NAME}
```

**For Render.com:**

- These will be set automatically by the `render.yaml` configuration
- Render generates secure passwords for you
- Never commit .env files!

---

### 2. **Empty API Configuration** ❌

**File:** `frontend/src/utils/api.ts` (FIXED! ✅)

**What was wrong:**

- File was completely empty
- Frontend couldn't communicate with backend

**What we fixed:**

- ✅ Created complete API client with all endpoints
- ✅ Automatic environment detection (dev vs production)
- ✅ Error handling and type safety
- ✅ Support for all your backend routes

**YOU MUST UPDATE after deploying to Render:**

```typescript
// Line 10 in frontend/src/utils/api.ts
const API_BASE_URL = (import.meta as any).env.PROD
  ? "https://YOUR-ACTUAL-RENDER-URL.onrender.com" // ← UPDATE THIS!
  : "http://localhost:8080";
```

---

### 3. **Missing CORS Configuration** ❌ (FIXED! ✅)

**File:** `backend/app.js`

**What was wrong:**

- No CORS headers
- Frontend requests would be blocked by browser

**What we fixed:**

- ✅ Added `cors` package
- ✅ Configured allowed origins
- ✅ Added proper headers and methods

**Make sure to:**

- Install cors package: `cd backend && npm install`
- Update ALLOWED_ORIGINS when you deploy

---

## 📝 Implementation Checklist

### Before Committing:

- [ ] Create `backend/.env` from `.env.example` (don't commit!)
- [ ] Create `frontend/.env.local` if needed (don't commit!)
- [ ] Verify `.gitignore` excludes `.env` files ✅ (already done!)
- [ ] Test locally with Docker: `docker-compose up`

### To Deploy to Render.com:

- [ ] Sign up at render.com (free, no credit card)
- [ ] Connect your GitHub repository
- [ ] Deploy using Blueprint (it will find `render.yaml`)
- [ ] Wait 3-5 minutes for deployment
- [ ] Copy your backend URL from Render dashboard
- [ ] Update `frontend/src/utils/api.ts` with your Render URL
- [ ] Initialize database with `database/init/init.sql`
- [ ] Test API: visit `https://your-app.onrender.com`
- [ ] Push to GitHub - frontend auto-deploys to GitHub Pages

### To Set Up Testing:

- [ ] Install frontend test dependencies:
  ```bash
  cd frontend
  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  ```
- [ ] Run tests: `npm test`
- [ ] Backend tests work out of the box: `cd backend && npm test`

---

## 🔄 How Your CI/CD Pipeline Works

### Current Setup:

1. **Docker Compose CI** (`.github/workflows/ci-docker-compose-.yml`)

   - Runs on every push/PR
   - Tests that Docker setup works
   - ✅ Already working!

2. **GitHub Pages Deploy** (`.github/workflows/deploy.yml`)

   - Runs on push to main
   - Builds frontend
   - Deploys to GitHub Pages
   - ✅ Already working!

3. **NEW: Test Workflow** (`.github/workflows/test.yml`)
   - Runs frontend and backend tests
   - Includes Docker integration tests
   - Will run on every PR
   - ⚠️ Needs test dependencies installed first

### To Enable Full CI/CD:

```bash
# 1. Install frontend test dependencies
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 2. Commit package.json changes
git add package.json package-lock.json
git commit -m "Add test dependencies"

# 3. Push - tests will now run automatically!
git push origin feature/backend-api-integration
```

---

## 🐳 Docker Compose Setup

### Your Docker Setup WILL WORK! ✅

**What we changed:**

- Backend now reads from environment variables
- Falls back to Docker defaults if env vars not set
- Fully backward compatible!

**To run locally:**

```bash
# Start everything
docker-compose up --build

# Access:
# - Frontend: http://localhost:80
# - Backend: http://localhost:8080
# - Database: localhost:5432

# Stop everything
docker-compose down

# Reset everything (including database)
docker-compose down -v
```

**Your docker-compose.yaml is READY TO USE!** No changes needed for local development.

---

## 💰 Cost Breakdown

### Free Option (Recommended for School Project):

- **GitHub Pages**: $0 (frontend hosting)
- **Render.com Backend**: $0 (spins down after 15 min)
- **Render.com Database**: $0 (free for 90 days)
- **UptimeRobot**: $0 (keeps API awake)
- **Total: $0/month** ✅

### Paid Option (If You Need Guaranteed Uptime):

- Upgrade Render backend: $7/month
- Do this only for presentation week
- Cancel after demo
- **Total: $7 for one month** ✅

### What NOT to Use:

- ❌ AWS: $20-40/month (too expensive!)
- ❌ Heroku: $7/month minimum (no free tier)
- ❌ DigitalOcean: $4/month (VPS requires setup)

---

## 🎯 Quick Start Guide

### Right Now (Local Development):

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Start Docker
cd ..
docker-compose up --build

# 4. Open browser
# Frontend: http://localhost:80
# Backend: http://localhost:8080
```

### This Week (Deploy to Production):

1. **Sign up for Render.com** (5 minutes)
2. **Connect GitHub** (2 clicks)
3. **Deploy with Blueprint** (automatic, 3-5 min wait)
4. **Copy backend URL** from Render dashboard
5. **Update frontend API URL** in `api.ts`
6. **Push to GitHub** (auto-deploys to GitHub Pages)
7. **Test everything** at cfurley.github.io/second-space

---

## 🚨 Common Issues & Solutions

### Issue: "CORS Error" in browser console

**Solution:**

- Make sure you installed cors: `cd backend && npm install`
- Check ALLOWED_ORIGINS includes your frontend URL
- Restart backend after changes

### Issue: "Cannot connect to database"

**Solution:**

- For Docker: Make sure database container is running
- For Render: Check DATABASE_URL is set in dashboard
- Wait 30 seconds after starting for database to be ready

### Issue: "API returns 404"

**Solution:**

- Verify frontend API URL matches backend URL
- Check that backend routes are registered in `app.js`
- Look at backend logs in Render dashboard

### Issue: "Tests fail in CI/CD"

**Solution:**

- Install test dependencies: `npm install --save-dev vitest ...`
- Commit package.json and package-lock.json
- Re-run the workflow

---

## 📚 Documentation Files

- **DEPLOYMENT.md**: Complete step-by-step deployment guide
- **README.md**: Project overview and architecture
- **render.yaml**: Render.com configuration (auto-deploy)
- **.env.example**: Template for environment variables
- **This file (REMINDERS.md)**: Critical issues to address

---

## ✅ Final Checklist Before Merging

- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Local Docker works (`docker-compose up`)
- [ ] Backend can connect to database
- [ ] Frontend can call backend API
- [ ] Tests run locally
- [ ] No .env files committed (check with `git status`)
- [ ] API URL is configurable (not hardcoded)
- [ ] CORS is enabled
- [ ] Security credentials are protected

---

## 🆘 If You Get Stuck

1. **Check logs first:**

   - Docker: `docker-compose logs backend`
   - Render: Dashboard → Service → Logs tab
   - Browser: F12 → Console tab

2. **Read the guides:**

   - DEPLOYMENT.md has step-by-step instructions
   - Each code file has comments explaining what it does

3. **Test locally first:**

   - Always test with Docker before deploying
   - Easier to debug on your machine

4. **Incremental changes:**
   - Make one change at a time
   - Test after each change
   - Commit working code

---

**Remember:** This is all set up to be $0 for your school project. You only need to pay if you want guaranteed 24/7 uptime during presentation week, and even then it's only $7 for one month!

**Good luck with your project! 🚀**
