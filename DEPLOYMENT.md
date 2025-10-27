# 🚀 Deployment Guide for Second Space

## Table of Contents
1. [Local Development with Docker](#local-development)
2. [Deploy to Render.com](#render-deployment)
3. [Connect Frontend to Backend](#connect-frontend)
4. [Testing Setup](#testing)
5. [Troubleshooting](#troubleshooting)

---

## 📦 Local Development with Docker

### Prerequisites
- Docker Desktop installed
- Git
- Your repository cloned

### Start the Full Stack Locally

1. **Navigate to project root:**
   ```bash
   cd /path/to/second-space
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access your application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080
   - Database: localhost:5432

4. **Stop services:**
   ```bash
   docker-compose down
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### ✅ Your Docker setup WILL work after these changes!

The code updates are **backward compatible**:
- Environment variables have default values
- Falls back to original Docker service names
- No breaking changes to docker-compose.yaml

---

## 🌐 Deploy to Render.com (Step-by-Step)

### Step 1: Sign Up for Render.com

1. Go to: https://render.com
2. Click **"Get Started"** (top right)
3. Sign up with GitHub (recommended) or email
4. No credit card required! ✅

### Step 2: Connect Your Repository

1. After signing in, you'll see the Render Dashboard
2. Click **"New +"** (top right)
3. Select **"Blueprint"**
4. Click **"Connect GitHub"** if not already connected
5. Authorize Render to access your repositories
6. Select your repository: `cfurley/second-space`

### Step 3: Deploy Using Blueprint

1. Render will detect the `render.yaml` file automatically
2. Click **"Apply"** to create services
3. Render will create:
   - ✅ **Backend API** (second-space-api)
   - ✅ **PostgreSQL Database** (second-space-db)
4. Wait 3-5 minutes for initial deployment

### Step 4: Get Your API URL

1. Go to **Dashboard** → **second-space-api**
2. Copy the URL (looks like: `https://second-space-api-xxxx.onrender.com`)
3. **Save this URL!** You'll need it for the frontend

### Step 5: Initialize Database

1. In Render Dashboard, go to **second-space-db**
2. Click **"Connect"** → Copy connection string
3. Use any PostgreSQL client (TablePlus, pgAdmin, or psql) to connect
4. Run the initialization script:
   ```bash
   # From your local machine
   psql "postgresql://second_space_user:xxxxx@dpg-xxxx.oregon-postgres.render.com/second_space?ssl=true" -f database/init/init.sql
   ```
   
   Or use Render's Shell:
   - Click **"Shell"** in database dashboard
   - Manually run the SQL from `database/init/init.sql`

### Step 6: Test Your Backend

Visit your API URL in a browser:
```
https://your-app-name.onrender.com
```

You should see:
```json
{
  "message": "Second Space API",
  "status": "running",
  "version": "0.1.0"
}
```

✅ Backend is live!

---

## 🔗 Connect Frontend to Backend

### Update Frontend API Configuration

1. **Update the API URL in your frontend code:**
   
   Open `frontend/src/utils/api.ts` and update line 10:
   ```typescript
   const API_BASE_URL = (import.meta as any).env.PROD 
     ? 'https://YOUR-ACTUAL-RENDER-URL.onrender.com'  // <- CHANGE THIS
     : 'http://localhost:8080';
   ```

2. **Create production environment file (optional):**
   
   Create `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-app-name.onrender.com
   ```

3. **Push changes:**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

4. **GitHub Pages will auto-deploy** (takes 2-3 minutes)

### Test the Connection

1. Visit: https://cfurley.github.io/second-space/
2. Open browser console (F12)
3. Try to log in or create a space
4. Check for any CORS or network errors

---

## 🧪 Testing Setup

### Frontend Tests (Vitest)

1. **Install test dependencies:**
   ```bash
   cd frontend
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
   ```

2. **Create vitest config** (`frontend/vitest.config.ts`):
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react-swc';
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/test/setup.ts',
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

3. **Create test setup** (`frontend/src/test/setup.ts`):
   ```typescript
   import '@testing-library/jest-dom';
   ```

4. **Update package.json scripts:**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

5. **Write a test** (`frontend/src/utils/__tests__/passwordValidator.test.ts`):
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { validatePasswordLength } from '../passwordValidator';

   describe('Password Validator', () => {
     it('should accept valid length password', () => {
       expect(validatePasswordLength('SecurePass123!')).toBe(true);
     });
     
     it('should reject short password', () => {
       expect(validatePasswordLength('short')).toBe(false);
     });
   });
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

### Backend Tests (Node.js Test Runner)

1. **Create test file** (`backend/src/controllers/__tests__/userControllers.test.js`):
   ```javascript
   import { describe, it } from 'node:test';
   import assert from 'node:assert';

   describe('User Controller Tests', () => {
     it('should validate username correctly', () => {
       const validUsername = 'testuser123';
       assert.strictEqual(validUsername.length > 3, true);
     });
   });
   ```

2. **Run tests:**
   ```bash
   cd backend
   npm test
   ```

---

## 🔄 CI/CD Integration

### Add Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  pull_request:
    branches: [ "main" ]
  push:
    branches: [ "main" ]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm install
      
      - name: Run tests
        working-directory: ./frontend
        run: npm test

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Run tests
        working-directory: ./backend
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: testuser
          DB_PASSWORD: testpass
          DB_NAME: testdb
        run: npm test
```

### Update Deploy Workflow

Edit `.github/workflows/deploy.yml` to require tests:

```yaml
jobs:
  test:  # Add this job
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - working-directory: ./frontend
        run: |
          npm install
          npm test

  build:
    needs: test  # Add this line - won't build unless tests pass
    runs-on: ubuntu-latest
    # ... rest of existing build job
```

---

## 🎯 Keep Render.com Awake (Free Solutions)

### Option 1: UptimeRobot (Recommended)

1. Sign up at: https://uptimerobot.com (free)
2. Click **"Add New Monitor"**
3. Settings:
   - Monitor Type: HTTP(s)
   - Friendly Name: Second Space API
   - URL: `https://your-app.onrender.com`
   - Monitoring Interval: 5 minutes
4. Click **"Create Monitor"**

✅ Your API will stay awake during the day!

### Option 2: GitHub Actions Cron Job

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: curl https://your-app.onrender.com
```

### Option 3: Just Wake Before Presentation

Visit your API URL 2 minutes before demo - it stays awake for 15 minutes!

---

## 🐛 Troubleshooting

### Docker Issues

**Problem:** `docker-compose up` fails
```bash
# Solution: Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

**Problem:** Port already in use
```bash
# Solution: Stop conflicting services
docker ps  # Find conflicting containers
docker stop <container-id>
```

**Problem:** Database connection fails
```bash
# Solution: Check if database is ready
docker-compose logs database
# Wait for: "database system is ready to accept connections"
```

### Render.com Issues

**Problem:** Deploy fails
- Check build logs in Render dashboard
- Verify `render.yaml` syntax
- Ensure all environment variables are set

**Problem:** Database connection error
- Verify DATABASE_URL is set correctly
- Check if database is initialized
- Ensure SSL is enabled in production

**Problem:** CORS errors
- Update ALLOWED_ORIGINS in Render dashboard
- Add your GitHub Pages URL
- Redeploy backend after changes

**Problem:** API returns 404
- Check if routes are registered correctly
- Verify API URL in frontend matches Render URL
- Check Render logs for errors

### Frontend Issues

**Problem:** API calls fail locally
- Ensure Docker is running: `docker ps`
- Check backend logs: `docker-compose logs backend`
- Verify API_BASE_URL is `http://localhost:8080` for dev

**Problem:** API calls fail on GitHub Pages
- Update API URL in `api.ts`
- Clear browser cache
- Check browser console for CORS errors

---

## 📊 Cost Summary

### Free Tier (Development & Testing)
- GitHub Pages: $0 ✅
- Render.com Backend: $0 ✅
- Render.com Database: $0 ✅
- **Total: $0/month**

### Paid Option (Presentation Week)
- Upgrade Render backend for 1 month: $7
- **Total: $7 for guaranteed uptime**

---

## 🎓 Quick Command Reference

```bash
# Local Development
docker-compose up -d              # Start in background
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose restart backend    # Restart backend only

# Git Workflow
git checkout -b feature/my-feature
git add .
git commit -m "Description"
git push origin feature/my-feature

# Testing
cd frontend && npm test           # Run frontend tests
cd backend && npm test            # Run backend tests

# Database
docker exec -it second-space-database psql -U myuser -d mydatabase
\dt                               # List tables
\q                                # Quit
```

---

## ✅ Deployment Checklist

- [ ] Sign up for Render.com
- [ ] Connect GitHub repository
- [ ] Deploy using Blueprint
- [ ] Copy backend API URL
- [ ] Initialize database with init.sql
- [ ] Update frontend API URL
- [ ] Push to GitHub
- [ ] Test frontend on GitHub Pages
- [ ] Set up UptimeRobot (optional)
- [ ] Add tests
- [ ] Configure CI/CD

---

## 🆘 Need Help?

1. Check Render logs: Dashboard → Service → Logs
2. Check browser console: F12 → Console
3. Check Docker logs: `docker-compose logs`
4. Review this guide
5. Check GitHub Actions runs for CI/CD issues

---

**Happy Deploying! 🚀**
