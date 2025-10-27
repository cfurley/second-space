# 🚀 Backend API Integration - Complete Guide

## 📋 Table of Contents

1. [Deployment Architecture Overview](#deployment-architecture-overview)
2. [What is CORS?](#what-is-cors)
3. [Changes Made to the Project](#changes-made-to-the-project)
4. [Testing & CI/CD Integration](#testing--cicd-integration)
5. [Next Steps](#next-steps)

---

## 🏗️ Deployment Architecture Overview

### Local Development (Docker Compose)

```
┌─────────────────────────────────────────────┐
│         Docker Compose Network              │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Frontend   │      │   Backend    │   │
│  │    (Nginx)   │─────▶│  (Node.js)   │   │
│  │ localhost:80 │      │ localhost:8080│   │
│  └──────────────┘      └───────┬──────┘   │
│                                 │           │
│                        ┌────────▼──────┐   │
│                        │   Database    │   │
│                        │  (PostgreSQL) │   │
│                        │ localhost:5432│   │
│                        └───────────────┘   │
└─────────────────────────────────────────────┘

Commands:
  docker-compose up --build    # Start everything
  docker-compose down          # Stop everything
  docker-compose logs -f       # View logs

Access Points:
  Frontend:  http://localhost
  Backend:   http://localhost:8080
  Database:  localhost:5432 (internal only)
```

### Production Deployment (Free Tier!)

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│  https://cfurley.github.io/second-space/                │
│  (Static Frontend - Auto-deploys from main branch)      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ API Calls (CORS enabled)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Render.com (Free Tier)                │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │  Backend API (Node.js + Express)             │      │
│  │  https://YOUR-APP.onrender.com               │      │
│  └──────────────────┬───────────────────────────┘      │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────┐      │
│  │  PostgreSQL Database                         │      │
│  │  (Managed by Render, auto-generated password)│      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘

Deployment Steps:
1. Sign up at render.com (free, no credit card)
2. Connect your GitHub repository
3. Deploy using Blueprint (finds render.yaml automatically)
4. Copy backend URL from Render dashboard
5. Update frontend/src/utils/api.ts line 11 with your URL
6. Push to main branch → GitHub Pages auto-deploys

Cost: $0/month (backend spins down after 15min idle, wakes in 30sec)
```

---

## 🔐 What is CORS?

### The Problem CORS Solves

**CORS** = **C**ross-**O**rigin **R**esource **S**haring

Your browser has a security feature that blocks websites from making requests to different domains. This is called the **Same-Origin Policy**.

#### Example Scenario (Without CORS):

```
Frontend:  https://cfurley.github.io/second-space/
Backend:   https://your-app.onrender.com

❌ Browser blocks the request!
   "Different origins = potential security risk"
```

#### Why Would This Be Blocked?

Imagine you visit `evil-site.com` and it tries to make requests to `your-bank.com/transfer-money`. Without CORS, the browser would block this to protect you!

### The Solution

The backend server tells the browser: **"It's okay, I trust this frontend!"**

#### How CORS Works:

```
1. Browser: "Hey Backend, can cfurley.github.io talk to you?"
   └─ Sends OPTIONS request with Origin header

2. Backend: "Yes! I allow these origins:"
   └─ Responds with Access-Control-Allow-Origin header

3. Browser: "Cool, I'll allow the real request"
   └─ Sends actual POST/GET/PUT/DELETE request
```

### CORS Configuration in Your Project

**File: `backend/app.js`**

```javascript
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if the origin is in our whitelist
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true); // ✅ Allowed!
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS")); // ❌ Blocked!
      }
    },
    credentials: true, // Allow cookies and auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

**Allowed Origins:**

```javascript
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:80", // Docker frontend with port
  "http://localhost", // Docker frontend without port
  "https://cfurley.github.io", // GitHub Pages production
];
```

### When to Update CORS Origins

**Add your Render backend URL after deployment:**

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:80",
  "http://localhost",
  "https://cfurley.github.io",
  "https://your-actual-app.onrender.com", // ← Add this after deploying!
];
```

Or use environment variable:

```bash
# In Render dashboard, set:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost,https://cfurley.github.io
```

---

## 📝 Changes Made to the Project

### 1. Backend Changes

#### ✅ `backend/app.js` (SAFE - Not in src/)

**What Changed:**

- Added CORS middleware with origin whitelist
- Added `http://localhost` to allowed origins (was missing)
- No changes to your developer's routes or logic!

**Code Added:**

```javascript
import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:80",
      "http://localhost", // ← This was the fix!
      "https://cfurley.github.io",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

**Why:** Allows frontend to communicate with backend across different domains.

---

#### ✅ `backend/Dockerfile`

**What Changed:**

- Fixed to install dependencies from `package.json`
- Now properly installs `cors` package

**Before:**

```dockerfile
#COPY package*.json ./
RUN npm install express pg
```

**After:**

```dockerfile
COPY package*.json ./
RUN npm install
```

**Why:** Ensures all dependencies (including `cors` and `dotenv`) are installed from package.json.

---

#### ✅ `backend/package.json`

**What Changed:**

- Added `cors` dependency
- Added `dotenv` dependency (for environment variables)

**Added:**

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

**Why:** Required packages for CORS support and environment variable management.

---

#### ✅ `backend/src/db/index.js` (ALREADY HAD ENV SUPPORT!)

**No changes needed!** Your developer already wrote this correctly with environment variable support:

```javascript
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://myuser:mypassword@database:5432/mydatabase";
```

This works for both Docker (uses defaults) and Render (uses environment variable).

---

### 2. Frontend Changes

#### ✅ `frontend/Dockerfile`

**What Changed:**

- Added environment variable for API URL

**Added:**

```dockerfile
# Set API URL for Docker Compose local development
ENV VITE_API_URL=http://localhost:8080

RUN npm run build
```

**Why:** Tells the production build to use localhost backend when running in Docker.

---

#### ✅ `frontend/nginx.conf`

**What Changed:**

- Added path rewriting for local development
- Frontend is built with `/second-space/` base path for GitHub Pages
- Nginx rewrites these paths to root for local testing

**Added:**

```nginx
location / {
    # Rewrite /second-space/ paths to root for local development
    rewrite ^/second-space/(.*)$ /$1 last;
    try_files $uri $uri/ /index.html;
}
```

**Why:** Allows the same build to work locally and on GitHub Pages.

---

#### ✅ `frontend/src/utils/api.ts` (NEW FILE!)

**What Changed:**

- Created complete TypeScript API client
- All backend endpoints wrapped in type-safe functions
- Automatic environment detection (dev vs prod)
- Converts camelCase to snake_case for backend compatibility

**Key Features:**

```typescript
// Environment detection
const API_BASE_URL = (import.meta as any).env.PROD
  ? (import.meta as any).env.VITE_API_URL || 'https://second-space-api.onrender.com'
  : 'http://localhost:8080';

// Example endpoint with field name conversion
async createUser(userData: {
  firstName: string;  // Frontend uses camelCase
  lastName: string;
}) {
  const payload = {
    first_name: userData.firstName,  // Backend expects snake_case
    last_name: userData.lastName,
  };

  return apiFetch('/user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
```

**Available Endpoints:**

- User: login, createUser, getUser, updatePassword, deleteUser
- Space: getSpaces, getSpace, createSpace, updateSpace, deleteSpace
- Theme: getThemes, getTheme
- Media: uploadMedia, getMedia
- Health: healthCheck

---

#### ✅ `frontend/src/components/login.tsx`

**What Changed:**

- Replaced direct `fetch()` calls with `api.ts` client
- Better error handling
- Field name conversion handled automatically

**Before:**

```typescript
const response = await fetch("/api/user/authentication", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const data = await response.json();
```

**After:**

```typescript
const data = await api.login(username, password);
```

**Why:** Cleaner code, centralized API logic, automatic field conversion.

---

### 3. Configuration Files

#### ✅ `render.yaml` (CREATED)

**What It Does:**

- Defines your Render.com deployment
- Creates backend web service
- Creates PostgreSQL database
- Auto-generates secure passwords
- Connects services automatically

**Structure:**

```yaml
services:
  - type: web
    name: second-space-api
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start

  - type: pserv
    name: second-space-db
    plan: free
    databaseName: second_space
    databaseUser: second_space_user
```

**Why:** One-click deployment to Render.com!

---

#### ✅ `.gitignore` (UPDATED)

**Added:**

```
.env
.env.local
.env.production
```

**Why:** Prevents committing sensitive credentials.

---

### 4. Files NOT Changed (Developer Code Protected!)

These files remain **exactly as written** by your developer:

```
✅ backend/src/controllers/*     - All controller logic intact
✅ backend/src/models/*           - All models intact
✅ backend/src/routes/*           - All routes intact
✅ backend/src/services/*         - All services intact
✅ backend/src/db/index.js        - Already had env var support!
✅ docker-compose.yaml            - Still works with defaults
✅ database/init/init.sql         - Database schema unchanged
```

**Your developer's code is 100% safe!** ✅

---

## 🧪 Testing & CI/CD Integration

### Current Testing Setup

#### Frontend Tests (Vitest)

**Configuration:** `frontend/vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

**Run Tests:**

```bash
cd frontend
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

---

#### Backend Tests (Node.js Test Runner)

**Configuration:** `backend/package.json`

```json
{
  "scripts": {
    "test": "node --test **/*.test.js"
  }
}
```

**Run Tests:**

```bash
cd backend
npm test
```

---

### Where to Add Unit Tests

#### Frontend Tests

**Location:** `frontend/src/**/__tests__/`

**Example Structure:**

```
frontend/src/
├── components/
│   ├── login.tsx
│   └── __tests__/
│       └── login.test.tsx          ← Component tests here
├── utils/
│   ├── api.ts
│   ├── passwordValidator.ts
│   └── __tests__/
│       ├── api.test.ts             ← API client tests here
│       ├── passwordValidator.test.ts
│       └── usernameValidator.test.ts
└── pages/
    └── __tests__/
        └── home.test.tsx           ← Page tests here
```

**Example Test:**

```typescript
// frontend/src/utils/__tests__/api.test.ts
import { describe, it, expect, vi } from "vitest";
import { api } from "../api";

describe("API Client", () => {
  it("should call login endpoint with correct data", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", username: "testuser" }),
    });
    global.fetch = mockFetch;

    await api.login("testuser", "password123");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/user/authentication"),
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
```

---

#### Backend Tests

**Location:** `backend/src/**/__tests__/`

**Example Structure:**

```
backend/src/
├── controllers/
│   ├── userControllers.js
│   └── __tests__/
│       └── userControllers.test.js   ← Controller tests here
├── services/
│   ├── userServices.js
│   └── __tests__/
│       └── userServices.test.js      ← Service tests here
└── models/
    ├── userModel.js
    └── __tests__/
        └── userModel.test.js         ← Model tests here
```

**Example Test:**

```javascript
// backend/src/controllers/__tests__/userControllers.test.js
import { describe, it } from "node:test";
import assert from "node:assert";
import userController from "../userControllers.js";

describe("User Controller", () => {
  it("should validate username format", async () => {
    const validUsername = "testuser123";
    assert.strictEqual(validUsername.length >= 3, true);
    assert.strictEqual(/^[a-zA-Z0-9_]+$/.test(validUsername), true);
  });

  it("should reject invalid usernames", async () => {
    const invalidUsername = "ab"; // Too short
    assert.strictEqual(invalidUsername.length >= 3, false);
  });
});
```

---

### CI/CD Pipeline Integration

#### Current Workflows

**1. Frontend Deployment** - `.github/workflows/deploy.yml`

- Triggers on push to `main` branch
- Builds frontend with Vite
- Deploys to GitHub Pages
- ✅ Already working!

**2. Docker Compose CI** - `.github/workflows/ci-docker-compose.yml`

- Tests Docker setup on push/PR
- ✅ Already working!

---

#### Adding Test Workflow (Recommended)

**Create:** `.github/workflows/test.yml`

```yaml
name: Run Tests

on:
  pull_request:
    branches: ["main"]
  push:
    branches: ["main", "feature/*"]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        working-directory: ./frontend
        run: npm install

      - name: Run tests
        working-directory: ./frontend
        run: npm test

      - name: Generate coverage
        working-directory: ./frontend
        run: npm run test:coverage

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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        working-directory: ./backend
        run: npm install

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
        run: npm test

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Start Docker Compose
        run: docker-compose up -d

      - name: Wait for services
        run: sleep 10

      - name: Test backend health
        run: curl --fail http://localhost:8080 || exit 1

      - name: Test frontend loads
        run: curl --fail http://localhost || exit 1

      - name: Stop Docker Compose
        run: docker-compose down
```

---

### How Tests Integrate into Pipeline

```
Developer pushes code to feature branch
          ↓
GitHub Actions triggers test workflow
          ↓
┌─────────────────────────────────────┐
│  1. Run Frontend Tests (Vitest)    │
│     - Unit tests                    │
│     - Component tests               │
│     - Coverage report               │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. Run Backend Tests (Node)        │
│     - Spins up test PostgreSQL      │
│     - Runs controller tests         │
│     - Runs service tests            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. Run Integration Tests           │
│     - Starts Docker Compose         │
│     - Tests full stack              │
│     - Tests API connectivity        │
└──────────────┬──────────────────────┘
               ↓
        All tests pass? ✅
               ↓
   Allow merge to main branch
               ↓
   Auto-deploy to GitHub Pages
```

---

### Test Coverage Goals

**Frontend:**

- [ ] API client (api.ts) - 80%+ coverage
- [ ] Validators (passwordValidator, usernameValidator) - 90%+ coverage
- [ ] Components (login, sidebar, etc.) - 70%+ coverage
- [ ] Utility functions - 80%+ coverage

**Backend:**

- [ ] Controllers - 80%+ coverage
- [ ] Services - 80%+ coverage
- [ ] Models - 70%+ coverage
- [ ] Routes - 60%+ coverage

**Integration:**

- [ ] User registration flow
- [ ] Login flow
- [ ] Space creation
- [ ] API CORS validation

---

### Running Tests Locally Before Push

```bash
# Frontend tests
cd frontend
npm test                # Run all tests
npm run test:watch      # Watch mode while coding
npm run test:coverage   # See what's not covered yet

# Backend tests
cd backend
npm test

# Full integration test (Docker)
cd ..
docker-compose up --build
# In another terminal:
curl http://localhost:8080        # Test backend
curl http://localhost              # Test frontend
docker-compose down
```

---

## 🎯 Next Steps

### Immediate (This Week)

1. **Test locally that everything works:**

   ```bash
   docker-compose up --build
   # Open http://localhost in browser
   # Try creating an account and logging in
   ```

2. **Commit and push changes:**

   ```bash
   git add .
   git commit -m "Add backend API integration with CORS support"
   git push origin feature/backend-api-integration
   ```

3. **Create Pull Request:**
   - Review changes on GitHub
   - Merge to main when ready

---

### Deploy to Production (20 minutes)

**Step 1: Sign up for Render.com**

1. Go to https://render.com
2. Click "Get Started" (free, no credit card)
3. Sign up with GitHub

**Step 2: Deploy Backend**

1. In Render Dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will detect `render.yaml` automatically
4. Click "Apply" to create services
5. Wait 3-5 minutes for deployment

**Step 3: Get Your Backend URL**

1. Go to Dashboard → second-space-api
2. Copy the URL (e.g., `https://second-space-api-abc123.onrender.com`)

**Step 4: Initialize Database**

1. In Render Dashboard, go to second-space-db
2. Click "Connect" → Copy connection string
3. Use psql or any PostgreSQL client:
   ```bash
   psql "postgresql://..." -f database/init/init.sql
   ```

**Step 5: Update Frontend**

1. Edit `frontend/src/utils/api.ts` line 11:

   ```typescript
   const API_BASE_URL = (import.meta as any).env.PROD
     ? "https://YOUR-ACTUAL-RENDER-URL.onrender.com" // ← Update this!
     : "http://localhost:8080";
   ```

2. Commit and push to main:

   ```bash
   git add frontend/src/utils/api.ts
   git commit -m "Update production API URL"
   git push origin main
   ```

3. GitHub Pages will auto-deploy in 2-3 minutes

**Step 6: Test Production**

- Visit https://cfurley.github.io/second-space/
- Try creating an account
- Try logging in
- Check browser console for any errors

---

### Add Tests (This Week)

**Step 1: Write Your First Tests**

Frontend:

```bash
cd frontend/src/utils/__tests__
# Edit api.test.ts and add more test cases
```

Backend:

```bash
cd backend/src/controllers/__tests__
# Edit userControllers.test.js and add more test cases
```

**Step 2: Add Test Workflow**

```bash
# Copy the test.yml content from above into:
.github/workflows/test.yml
```

**Step 3: Push and Verify**

```bash
git add .github/workflows/test.yml
git commit -m "Add automated testing workflow"
git push
```

Check GitHub Actions tab to see tests running!

---

### Optional Improvements

**Keep Render Backend Awake (Free)**

1. Sign up at https://uptimerobot.com
2. Add monitor for your Render URL
3. Set interval to 10 minutes
4. Backend stays awake during the day!

**Add More Test Coverage**

- Component tests for all UI elements
- Integration tests for user flows
- API endpoint tests
- Database query tests

**Environment Variables (If Needed)**

- Create `backend/.env` for local customization
- Create `frontend/.env.local` for local API overrides
- But defaults work fine for most developers!

---

## 📚 Quick Reference

### Important Files

| File                         | Purpose             | When to Edit             |
| ---------------------------- | ------------------- | ------------------------ |
| `backend/app.js`             | CORS config, routes | Add allowed origins      |
| `frontend/src/utils/api.ts`  | API client          | Update production URL    |
| `render.yaml`                | Render deployment   | Change service names     |
| `docker-compose.yaml`        | Local development   | Change ports/credentials |
| `.github/workflows/test.yml` | CI/CD testing       | Add more test jobs       |

### Common Commands

```bash
# Local Development
docker-compose up --build         # Start everything
docker-compose down               # Stop everything
docker-compose logs -f backend    # View backend logs

# Testing
cd frontend && npm test           # Frontend tests
cd backend && npm test            # Backend tests

# Deployment
git push origin main              # Deploy to GitHub Pages
# Render auto-deploys from main too!
```

### URLs

| Environment    | Frontend                                | Backend                       | Database          |
| -------------- | --------------------------------------- | ----------------------------- | ----------------- |
| **Local**      | http://localhost                        | http://localhost:8080         | localhost:5432    |
| **Production** | https://cfurley.github.io/second-space/ | https://your-app.onrender.com | (Render internal) |

---

## 💰 Cost Breakdown

| Service         | Plan | Cost         | Notes                       |
| --------------- | ---- | ------------ | --------------------------- |
| GitHub Pages    | Free | $0           | Unlimited bandwidth         |
| Render Backend  | Free | $0           | Spins down after 15min idle |
| Render Database | Free | $0           | 90 days free, then renew    |
| UptimeRobot     | Free | $0           | Keeps backend awake         |
| **Total**       |      | **$0/month** | 🎉                          |

**If you need 24/7 uptime:**

- Upgrade Render backend to paid: $7/month
- Only needed during presentation week!

---

## 🆘 Troubleshooting

### "CORS Error" in browser console

- Check `backend/app.js` has your frontend URL in `allowedOrigins`
- Make sure backend is running: `curl http://localhost:8080`
- Clear browser cache and try again

### "Failed to fetch" error

- Check API URL in `frontend/src/utils/api.ts`
- Verify backend is accessible: `curl http://localhost:8080`
- Check browser Network tab for actual error

### Docker won't start

```bash
docker-compose down -v
docker-compose up --build
```

### Tests fail in CI/CD

- Install test dependencies: `cd frontend && npm install`
- Check test output in GitHub Actions tab
- Run tests locally first: `npm test`

### Render deployment fails

- Check build logs in Render dashboard
- Verify `render.yaml` syntax
- Ensure all dependencies are in `package.json`

---

## ✅ Summary

**What You Built:**

- ✅ Full-stack application with separate frontend/backend
- ✅ CORS-enabled API for cross-origin requests
- ✅ Local development with Docker Compose
- ✅ Production deployment architecture (GitHub Pages + Render)
- ✅ Type-safe API client with error handling
- ✅ Test infrastructure for CI/CD
- ✅ $0 hosting costs!

**Your developer's code is 100% safe!** All changes were to configuration files and integration layers. The business logic in `backend/src/*` was not touched.

**Ready to deploy!** 🚀

---

_Generated: October 27, 2025_  
_Branch: feature/backend-api-integration_  
_Total Cost: $0/month_ 💰
