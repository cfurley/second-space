# 📦 Second Space - Complete Project Overview

> **Last Updated:** October 27, 2025  
> **Branch:** feature/backend-api-integration  
> **Status:** ✅ Ready for Production Deployment

---

## 🎯 Executive Summary

**Second Space** is a full-stack web application for creating AI-powered visual mood boards and think spaces. The project is designed for ease of development with Docker, zero-cost deployment, and a clean separation between frontend and backend.

### Current State

- ✅ **Local Development:** Fully working with Docker Compose
- ✅ **Frontend:** Deployed to GitHub Pages (auto-deploy on push)
- 🚧 **Backend:** Ready to deploy to Render.com (20 minutes setup)
- ✅ **Database:** Initialized with schema and seed data
- ✅ **API Integration:** CORS-enabled, type-safe client
- ✅ **CI/CD:** Automated testing and deployment pipelines

### Cost

**$0/month** for hosting (free tiers: GitHub Pages + Render.com)

---

## 📂 Project Structure

```
second-space/
├── 📱 frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # UI components (Login, Sidebar, etc.)
│   │   ├── utils/           # API client, validators
│   │   ├── pages/           # Page components
│   │   ├── styles/          # Global styles
│   │   └── App.tsx          # Main app component
│   ├── Dockerfile           # Multi-stage build (Node → Nginx)
│   ├── nginx.conf           # Nginx reverse proxy config
│   ├── package.json         # Dependencies & scripts
│   ├── vite.config.ts       # Vite build configuration
│   └── tailwind.config.js   # Tailwind CSS settings
│
├── ⚙️ backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers (userControllers.js, etc.)
│   │   ├── services/        # Business logic (userServices.js, etc.)
│   │   ├── models/          # Data models (userModel.js, etc.)
│   │   ├── routes/          # Route definitions (userRoutes.js, etc.)
│   │   └── db/
│   │       └── index.js     # PostgreSQL connection pool
│   ├── app.js               # Express server setup (CORS, routes)
│   ├── Dockerfile           # Backend container build
│   ├── package.json         # Dependencies & scripts
│   └── test.js              # Sample tests
│
├── 🗄️ database/             # PostgreSQL setup
│   ├── init/
│   │   └── init.sql         # Database schema & seed data
│   └── README.md
│
├── 🤖 ai-server/            # Future AI integration
│   └── README.md            # Placeholder for AI features
│
├── 📦 resources/            # Static assets
│   ├── FigmaMarkupV1.png    # Design mockup
│   ├── second_space_architecture.png
│   └── README.md
│
├── ⚙️ .github/workflows/    # CI/CD pipelines
│   ├── deploy.yml           # Deploy frontend to GitHub Pages
│   └── ci-docker-compose.yml # Test Docker setup
│
├── 📄 README.md             # Main project documentation (UPDATED! ✅)
├── 📘 INTEGRATION_GUIDE.md  # Architecture, CORS, API, testing
├── 📗 PROJECT_OVERVIEW.md   # This file! Complete project reference
├── � PROJECT_REVIEW.md     # Project assessment and recommendations
├── 📕 RENDER_DEPLOYMENT.md  # Render.com deployment guide
│
└── 🐳 docker-compose.yaml   # Multi-container orchestration
└── 🎯 render.yaml           # Render.com deployment config
└── .gitignore               # Exclude node_modules, .env files
```

---

## 🔧 Technology Stack

### Frontend

| Technology       | Version | Purpose                         |
| ---------------- | ------- | ------------------------------- |
| **React**        | 18.3.1  | UI framework                    |
| **TypeScript**   | Latest  | Type safety                     |
| **Vite**         | 6.4.1   | Build tool & dev server         |
| **Tailwind CSS** | 4.x     | Utility-first styling           |
| **Radix UI**     | Various | Accessible component primitives |
| **Lucide React** | 0.487   | Icon library                    |

### Backend

| Technology     | Version | Purpose                       |
| -------------- | ------- | ----------------------------- |
| **Node.js**    | 22      | JavaScript runtime            |
| **Express**    | 4.18.2  | Web framework                 |
| **PostgreSQL** | 16      | Relational database           |
| **CORS**       | 2.8.5   | Cross-origin resource sharing |
| **pg**         | 8.11.3  | PostgreSQL client             |

### DevOps

| Tool               | Purpose                       |
| ------------------ | ----------------------------- |
| **Docker**         | Containerization              |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD pipelines               |
| **Nginx**          | Web server & reverse proxy    |

### Deployment

| Service          | Tier | Purpose                    |
| ---------------- | ---- | -------------------------- |
| **GitHub Pages** | Free | Static frontend hosting    |
| **Render.com**   | Free | Backend & database hosting |

---

## 🏗️ Architecture Deep Dive

### Local Development (Docker Compose)

```
┌─────────────────────────────────────────────────────┐
│              Docker Compose Network                 │
│                  (app-network)                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  Frontend Container (Nginx)                  │ │
│  │  - Serves React app on port 80              │ │
│  │  - Proxies /api/* to backend                │ │
│  │  - Path rewriting for /second-space/        │ │
│  └──────────────────┬───────────────────────────┘ │
│                     │                               │
│                     │ HTTP requests                 │
│                     ▼                               │
│  ┌──────────────────────────────────────────────┐ │
│  │  Backend Container (Node.js)                 │ │
│  │  - Express server on port 8080              │ │
│  │  - CORS enabled for localhost origins       │ │
│  │  - API routes: /user, /spaces, /themes      │ │
│  └──────────────────┬───────────────────────────┘ │
│                     │                               │
│                     │ SQL queries                   │
│                     ▼                               │
│  ┌──────────────────────────────────────────────┐ │
│  │  Database Container (PostgreSQL 16)          │ │
│  │  - Port 5432 (internal to Docker)           │ │
│  │  - Persistent volume: second_space_data     │ │
│  │  - Init scripts run on first start          │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

Host machine can access:
  - Frontend: http://localhost (port 80)
  - Backend: http://localhost:8080
  - Database: localhost:5432 (with credentials)
```

### Production Deployment

```
┌─────────────────────────────────────────────────────┐
│          GitHub Pages (Free CDN)                    │
│  https://cfurley.github.io/second-space/            │
│  - Static React build (HTML/CSS/JS)                │
│  - Auto-deploys from main branch                   │
│  - Global CDN (fast worldwide)                     │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ API calls (fetch)
                    │ with CORS headers
                    ▼
┌─────────────────────────────────────────────────────┐
│              Render.com (Free Tier)                 │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  Backend Web Service                         │ │
│  │  https://second-space-api.onrender.com       │ │
│  │  - Auto-deploy from GitHub main             │ │
│  │  - Spins down after 15 min idle             │ │
│  │  - Wakes up in ~30 seconds                  │ │
│  │  - Environment variables set in dashboard   │ │
│  └──────────────────┬───────────────────────────┘ │
│                     │                               │
│                     │ DATABASE_URL                  │
│                     ▼                               │
│  ┌──────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                         │ │
│  │  - Managed by Render                        │ │
│  │  - Free for 90 days                         │ │
│  │  - Auto-generated secure password           │ │
│  │  - SSL/TLS encrypted connections            │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

Data flow:
1. User visits GitHub Pages URL
2. Browser loads React app (HTML/CSS/JS)
3. User interacts with UI (login, create space, etc.)
4. React calls API via fetch() → Render backend
5. Backend validates, processes, queries database
6. Backend returns JSON response
7. React updates UI with data
```

---

## 🔑 Key Concepts

### CORS (Cross-Origin Resource Sharing)

**Problem:** Browsers block requests between different domains for security.

**Example:**

```
Frontend: https://cfurley.github.io/second-space/
Backend:  https://second-space-api.onrender.com

Without CORS: ❌ Browser blocks the request
With CORS:    ✅ Backend tells browser "this origin is allowed"
```

**Implementation:** `backend/app.js`

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev
      "http://localhost:80", // Docker
      "http://localhost", // Docker (no port)
      "https://cfurley.github.io", // Production
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
```

**When to Update:** Add your Render backend URL to this list after deployment!

---

### Environment Variables

**Purpose:** Keep sensitive data (passwords, API keys) out of code.

**How it works:**

```
Code reads:        process.env.DATABASE_URL
Value comes from:  .env file (local) OR Render dashboard (production)
```

**Local Development:**

- `.env` files are optional (defaults work!)
- `docker-compose.yaml` has working credentials
- Database URL: `postgresql://myuser:mypassword@database:5432/mydatabase`

**Production:**

- Render auto-generates secure passwords
- Set in Render dashboard → Environment Variables
- Backend reads `process.env.DATABASE_URL`

**Security:**

- ✅ `.env` files in `.gitignore` (never committed)
- ✅ Production passwords auto-generated by Render
- ✅ Defaults in docker-compose.yaml are safe (local only)

---

### API Client Pattern

**Problem:** Frontend needs to call backend from many components.

**Solution:** Centralized API client (`frontend/src/utils/api.ts`)

**Benefits:**

1. **One place** to change API URL
2. **Type safety** with TypeScript
3. **Error handling** in one spot
4. **Field conversion** (camelCase ↔ snake_case)
5. **Environment detection** (dev vs prod)

**Example:**

```typescript
// Instead of this everywhere:
const response = await fetch("/user/authentication", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});
const data = await response.json();

// Do this:
const data = await api.login(username, password);
```

---

## 📋 Developer Workflow

### Daily Development

```bash
# 1. Start Docker (fresh terminal)
docker-compose up --build

# 2. Open browser
open http://localhost

# 3. Make changes to code
# Files are mounted, so changes reflect immediately!

# 4. View logs (new terminal)
docker-compose logs -f backend
docker-compose logs -f frontend

# 5. Stop when done
docker-compose down
```

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test locally
docker-compose up --build

# 3. Run tests
cd frontend && npm test
cd backend && npm test

# 4. Commit with descriptive message
git add .
git commit -m "Add user profile editing feature"

# 5. Push to GitHub
git push origin feature/your-feature-name

# 6. Open Pull Request on GitHub
# Tests run automatically!
# Team member reviews
# Merge to main when approved

# 7. Auto-deploy!
# Frontend: GitHub Pages (2-3 minutes)
# Backend: Render.com (when you deploy it)
```

---

## 🧪 Testing Strategy

### Test Organization

```
frontend/src/
├── utils/__tests__/
│   ├── api.test.ts              ← API client tests
│   ├── passwordValidator.test.ts
│   └── usernameValidator.test.ts
├── components/__tests__/
│   ├── login.test.tsx           ← Component tests
│   └── sidebar.test.tsx
└── pages/__tests__/
    └── home.test.tsx            ← Page tests

backend/src/
├── controllers/__tests__/
│   └── userControllers.test.js  ← Controller tests
├── services/__tests__/
│   └── userServices.test.js     ← Service/business logic tests
└── models/__tests__/
    └── userModel.test.js        ← Model tests
```

### Running Tests

```bash
# Frontend (Vitest)
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode (during development)
npm run test:coverage # With coverage report

# Backend (Node.js test runner)
cd backend
npm test

# Integration (Docker)
docker-compose up --build
curl http://localhost:8080        # Test backend
curl http://localhost              # Test frontend
docker-compose down
```

### CI/CD Integration

**Currently Active:**

- ✅ Docker Compose CI (tests Docker setup on every push)
- ✅ GitHub Pages Deploy (auto-deploys frontend on main)

**To Add** (see INTEGRATION_GUIDE.md):

- 🚧 Test Workflow (runs all tests on PR)
- 🚧 Coverage Reports (track test coverage)

---

## 🚀 Deployment Guide

### Prerequisites

- [ ] GitHub account (you have this!)
- [ ] Render.com account (free, sign up takes 2 min)
- [ ] Local setup tested with `docker-compose up`

### Step 1: Test Everything Locally

```bash
# Make sure this works perfectly
docker-compose up --build

# Test in browser:
# 1. Visit http://localhost
# 2. Create an account
# 3. Log in
# 4. Create a space

# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Stop when satisfied
docker-compose down
```

### Step 2: Deploy Backend to Render.com

**2a. Sign Up**

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (easiest)
4. Authorize Render to access your repos

**2b. Create Blueprint Deployment**

1. In Render Dashboard, click "New +" → "Blueprint"
2. Select repository: `cfurley/second-space`
3. Render detects `render.yaml` automatically
4. Click "Apply" to create services
5. Wait 3-5 minutes for initial deploy

**2c. Get Backend URL**

1. Dashboard → Services → `second-space-api`
2. Copy URL: `https://second-space-api-XXXXX.onrender.com`
3. **Save this!** You'll need it for frontend

**2d. Initialize Database**

```bash
# Get connection string from Render dashboard
# Database → second-space-db → Connect

# Run initialization script
psql "postgresql://..." -f database/init/init.sql

# Or manually copy/paste SQL from database/init/init.sql
```

### Step 3: Update Frontend API URL

**Edit `frontend/src/utils/api.ts` line 11:**

```typescript
const API_BASE_URL = (import.meta as any).env.PROD
  ? "https://YOUR-ACTUAL-RENDER-URL.onrender.com" // ← CHANGE THIS!
  : "http://localhost:8080";
```

### Step 4: Deploy Frontend

```bash
# Commit the API URL change
git add frontend/src/utils/api.ts
git commit -m "Update production API URL to Render backend"

# Push to main branch
git push origin main

# GitHub Actions will auto-deploy in 2-3 minutes
# Check: https://github.com/cfurley/second-space/actions
```

### Step 5: Test Production

1. Visit: https://cfurley.github.io/second-space/
2. Open browser console (F12)
3. Create an account
4. Check console for errors
5. Try logging in
6. Create a space

**If you see CORS errors:**

- Add Render backend URL to `backend/app.js` allowed origins
- Commit and push to trigger redeploy

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database" (Local)

**Symptoms:**

- Backend crashes on startup
- Error: "ECONNREFUSED 127.0.0.1:5432"

**Solution:**

```bash
# Database might not be ready yet
# Wait 10 seconds and check:
docker-compose logs database | grep "ready to accept connections"

# If database isn't running:
docker-compose down -v
docker-compose up --build
```

---

### Issue: "CORS Error" in Browser Console

**Symptoms:**

- Frontend loads but API calls fail
- Console: "blocked by CORS policy"

**Solution:**

```javascript
// Check backend/app.js has your frontend URL:
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:80",
  "http://localhost",
  "https://cfurley.github.io", // ✅ Make sure this is here
];

// After deployment, add Render backend:
("https://your-actual-app.onrender.com");
```

---

### Issue: "Failed to fetch" from Frontend

**Symptoms:**

- Login button click does nothing
- Console: "Failed to fetch"

**Solution:**

```typescript
// Check frontend/src/utils/api.ts:
const API_BASE_URL = (import.meta as any).env.PROD
  ? "https://YOUR-RENDER-URL.onrender.com" // ← Check this URL!
  : "http://localhost:8080";

// Make sure URL matches your Render backend exactly
```

---

### Issue: Docker Won't Start

**Symptoms:**

- `docker-compose up` fails
- Port already in use errors

**Solution:**

```bash
# Stop all containers
docker-compose down -v

# Clean Docker system (careful: removes all stopped containers)
docker system prune -a

# Start fresh
docker-compose up --build
```

---

### Issue: Frontend Shows Blank Page

**Symptoms:**

- Browser shows white screen
- Console has errors about missing modules

**Solution:**

```bash
# Rebuild without cache
docker-compose build --no-cache frontend
docker-compose up -d
```

---

### Issue: Database Tables Don't Exist

**Symptoms:**

- Backend errors about missing tables
- SQL errors in logs

**Solution:**

```bash
# Init script runs only on first start
# If database volume already exists, script won't run

# Delete volume and restart:
docker-compose down -v
docker-compose up --build

# Or manually run init script:
docker exec -i second-space-database psql -U myuser -d mydatabase < database/init/init.sql
```

---

## 📊 Project Health Checklist

### ✅ What's Working

- [x] Docker Compose local development
- [x] Frontend builds and deploys to GitHub Pages
- [x] Backend serves API with CORS enabled
- [x] Database initializes with schema
- [x] User authentication (signup/login)
- [x] Space creation and management
- [x] Theme customization
- [x] API client with type safety
- [x] Environment variable support
- [x] CI/CD for frontend deployment

### 🚧 In Progress

- [ ] Backend deployed to Render.com (20 min setup)
- [ ] Production database initialized
- [ ] API URL updated in frontend
- [ ] Full end-to-end production test

### 🎯 Future Enhancements

- [ ] Comprehensive test coverage (>80%)
- [ ] AI integration for media scraping
- [ ] Real-time collaboration features
- [ ] Time capsule functionality
- [ ] Custom theme editor
- [ ] Profile picture upload
- [ ] Social media integration
- [ ] Media upload and management

---

## 🎓 Best Practices

### Code Style

**Frontend (TypeScript/React):**

```typescript
// ✅ Good
interface UserProps {
  username: string;
  onLogin: () => void;
}

export function UserProfile({ username, onLogin }: UserProps) {
  return <div>Welcome {username}</div>;
}

// ❌ Avoid
export default function UserProfile(props: any) {
  return <div>Welcome {props.user}</div>;
}
```

**Backend (JavaScript/Node):**

```javascript
// ✅ Good
const createUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await userService.create({ username, password });
    return res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ❌ Avoid
const createUser = (req, res) => {
  const user = userService.create(req.body);
  res.json(user);
};
```

### Git Commit Messages

```bash
# ✅ Good
git commit -m "Add password validation to user registration"
git commit -m "Fix CORS error for GitHub Pages origin"
git commit -m "Update API client to handle 404 responses"

# ❌ Avoid
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "updates"
```

### Pull Request Guidelines

**Before creating PR:**

1. Test locally with `docker-compose up`
2. Run all tests (`npm test`)
3. Check browser console for errors
4. Review your own diff on GitHub
5. Write descriptive PR description

**PR Description Template:**

```markdown
## What This PR Does

Brief summary of changes

## How to Test

1. Start docker-compose
2. Navigate to login page
3. Try creating account
4. Verify email validation works

## Screenshots (if UI changes)

[Add screenshots]

## Checklist

- [ ] Tests pass locally
- [ ] No console errors
- [ ] Code follows style guide
- [ ] Documentation updated (if needed)
```

---

## 🔐 Security Notes

### What's Safe to Commit

✅ **Safe:**

- `docker-compose.yaml` with local credentials (myuser/mypassword)
- `.env.example` files (templates only)
- `render.yaml` (no secrets, just config)
- Code with `process.env.VARIABLE` references

❌ **NEVER Commit:**

- `.env` files with real credentials
- `.env.local` with API keys
- `.env.production` with production secrets
- Hardcoded passwords in code
- Database connection strings with real passwords
- API keys or tokens

### How Secrets Are Managed

**Local Development:**

```
Credentials in: docker-compose.yaml (defaults)
Used by: Local Docker containers only
Risk: LOW (not exposed to internet)
```

**Production:**

```
Credentials in: Render dashboard → Environment Variables
Used by: Render.com servers only
Risk: LOW (Render manages security)
Generated by: Render (auto-creates secure passwords)
```

---

## 📞 Getting Help

### Documentation Resources

1. **README.md** - Quick start and contribution guide
2. **INTEGRATION_GUIDE.md** - Deep dive into architecture, CORS, API, testing
3. **PROJECT_OVERVIEW.md** - This file! Complete project reference

### Troubleshooting Steps

1. **Check logs first:**

   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs database
   ```

2. **Check browser console:**

   - Open DevTools (F12)
   - Console tab for errors
   - Network tab for API calls

3. **Verify services are running:**

   ```bash
   docker-compose ps
   curl http://localhost:8080      # Backend
   curl http://localhost            # Frontend
   ```

4. **Search existing issues:**

   - GitHub Issues tab
   - Check closed issues too

5. **Ask the team:**
   - Open a new GitHub Issue
   - Include error logs
   - Describe steps to reproduce

---

## 📈 Project Metrics

### Current State

**Lines of Code:**

- Frontend: ~15,000+ lines (React components, styles, utils)
- Backend: ~2,000+ lines (API, services, models)
- Database: ~300+ lines (schema and seed data)

**Dependencies:**

- Frontend: 46 packages (Radix UI, React, Vite, Tailwind)
- Backend: 3 packages (Express, pg, cors)

**Test Coverage:**

- Frontend: ~18 tests (validators, API client)
- Backend: Sample tests ready for expansion

**Deployment Time:**

- Local startup: ~30 seconds (Docker Compose)
- Frontend deploy: 2-3 minutes (GitHub Actions)
- Backend deploy: 3-5 minutes (Render.com first time)

---

## 🎯 Next Sprint Goals

### Immediate (This Week)

1. ✅ Complete backend API integration (DONE!)
2. 🚧 Deploy backend to Render.com
3. 🚧 Test full production stack
4. 🚧 Write more unit tests (target: 50% coverage)

### Short Term (Next 2 Weeks)

1. Add media upload functionality
2. Implement real-time collaboration prototype
3. Add email verification for signups
4. Improve error handling and validation

### Medium Term (Next Month)

1. Begin AI integration (media scraping)
2. Add time capsule feature
3. Implement custom theme editor
4. Add profile picture upload
5. Increase test coverage to 80%

### Long Term (This Semester)

1. Complete AI-powered media organization
2. Real-time multiplayer collaboration
3. Social media integration
4. Mobile-responsive design improvements
5. Performance optimization

---

## 🏆 Team Guidelines

### Communication

- **Daily:** Quick updates in team chat
- **Weekly:** Stand-up meetings (async or sync)
- **PR Reviews:** Within 24 hours
- **Issues:** Tag teammates for urgent items

### Code Review Standards

- ✅ Does it work? (test locally)
- ✅ Is it readable? (clear variable names, comments)
- ✅ Is it tested? (unit tests for new features)
- ✅ Is it secure? (no hardcoded secrets)
- ✅ Is it documented? (update README if needed)

### When to Create an Issue

- 🐛 **Bug:** Something broken in main branch
- ✨ **Feature:** New functionality to add
- 📝 **Documentation:** Improve/add docs
- ❓ **Question:** Need help understanding something

### When to Create a PR

- After implementing an issue
- After testing locally
- With descriptive title and description
- Tagged with relevant labels

---

## 💡 Pro Tips

### Faster Docker Builds

```bash
# Build specific service only
docker-compose build frontend

# Use cached layers when possible
docker-compose up --build

# Clean everything and start fresh (slow but fixes issues)
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Debugging Backend

```javascript
// Add this anywhere in backend code:
console.log('DEBUG:', JSON.stringify(yourVariable, null, 2));

// View in terminal:
docker-compose logs -f backend | grep DEBUG
```

### Debugging Frontend

```typescript
// Add this in React component:
console.log("Component State:", { username, isLoading, error });

// View in browser console (F12)
```

### Quick Database Queries

```bash
# Connect to database
docker exec -it second-space-database psql -U myuser -d mydatabase

# List tables
\dt

# Query users
SELECT * FROM "user";

# Exit
\q
```

---

## 📚 Learning Resources

### For Frontend Developers

- [React Docs](https://react.dev) - Official React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
- [Vite Guide](https://vite.dev/guide/) - Build tool

### For Backend Developers

- [Express.js Guide](https://expressjs.com/en/guide/routing.html) - Web framework
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html) - Database
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Patterns

### For DevOps

- [Docker Compose Docs](https://docs.docker.com/compose/) - Multi-container apps
- [GitHub Actions](https://docs.github.com/en/actions) - CI/CD automation
- [Render Docs](https://render.com/docs) - Deployment platform

---

## 🎉 You're Ready!

This document covers everything you need to know to work on Second Space effectively. Key points:

1. **Start here:** `docker-compose up --build`
2. **Make changes:** Edit code, test locally
3. **Push to GitHub:** Create feature branch, open PR
4. **Deploy:** Merge to main auto-deploys frontend, Render for backend
5. **Get help:** Check docs, logs, ask team

**Total time to production:** ~30 minutes after backend deployment!

**Total cost:** $0/month 🎉

---

_Last Updated: October 27, 2025_  
_Team: CS3203 Group D_  
_License: MIT_  
_© 2025 Second Space_
