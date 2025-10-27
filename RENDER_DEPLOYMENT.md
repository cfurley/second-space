# 🚀 Render.com Deployment Guide - Quick Setup

> **Time Required:** 20 minutes  
> **Cost:** $0/month (Free Tier)  
> **Prerequisites:** GitHub account with push access to this repo

---

## 📋 Pre-Deployment Checklist

Before you start, make sure:

- [ ] Local Docker setup works (`docker-compose up` runs successfully)
- [ ] You can create an account and log in at http://localhost
- [ ] All changes are committed and pushed to GitHub
- [ ] You're ready to merge `feature/backend-api-integration` to `main`

---

## 🎯 Quick Start (Follow These Steps)

### Step 1: Create Render Account (2 minutes)

1. **Visit:** https://render.com
2. **Click:** "Get Started" (top right)
3. **Sign up with GitHub** (recommended - makes everything easier)
4. **Authorize Render** to access your repositories
   - Choose "All repositories" OR select only `second-space`
5. ✅ **No credit card required!**

---

### Step 2: Deploy with Blueprint (5 minutes)

Your project has a `render.yaml` file that automates everything!

1. **In Render Dashboard, click "New +"** (top right)

2. **Select "Blueprint"**

3. **Connect Repository:**

   - Choose: `cfurley/second-space`
   - Branch: `main` (make sure you've merged your feature branch first!)
   - Render scans and finds `render.yaml`

4. **Review the Blueprint:**
   You should see:

   ```
   ✅ second-space-api (Web Service)
   ✅ second-space-db (PostgreSQL Database)
   ```

5. **Click "Apply"**

6. **Wait 3-5 minutes** for deployment
   - You'll see build logs streaming
   - Backend will install dependencies and start
   - Database will be created with auto-generated password
   - Wait for: ✅ "Deploy succeeded"

---

### Step 3: Get Your Backend URL (30 seconds)

1. **Go to Render Dashboard**

2. **Click on `second-space-api`** service

3. **Copy the URL at the top:**

   ```
   https://second-space-api-XXXX.onrender.com
   ```

4. **📋 Save this URL - you'll need it in the next steps!**

---

### Step 4: Initialize Database (3 minutes)

The database exists but is empty. You need to run the init script.

#### Option A: Using psql from Your Computer (Recommended)

1. **Get Database Connection String:**

   - Render Dashboard → `second-space-db`
   - Click "Connect" button (top right)
   - Select "External Connection" tab
   - Copy the **PSQL Command** (entire thing in quotes)

2. **Run the init script:**

   ```bash
   # Make sure you're in the project root
   cd /path/to/second-space

   # Run init script (replace with YOUR connection string from Render)
   psql "postgresql://second_space_user:PASSWORD@HOST.oregon-postgres.render.com/second_space?ssl=true" \
     -f database/init/init.sql
   ```

3. **Verify it worked:**

   ```bash
   # Check tables were created
   psql "YOUR_CONNECTION_STRING" -c "\dt"

   # Should see: user, space, theme, container, media, etc.
   ```

#### Option B: Using Render Dashboard Shell

1. **Render Dashboard → `second-space-db`**

2. **Click "Shell" tab**

   - You're now connected to the database

3. **Copy contents of `database/init/init.sql`**

   - Open `database/init/init.sql` in VS Code
   - Copy all the SQL

4. **Paste into Render Shell and press Enter**

5. **You should see:**
   ```
   CREATE TABLE
   CREATE TABLE
   INSERT 0 1
   ...
   ```

---

### Step 5: Update Frontend API URL (2 minutes)

Tell your frontend where to find the backend:

1. **Open `frontend/src/utils/api.ts`**

2. **Find line 10-11** (the API_BASE_URL line)

3. **Replace with YOUR Render backend URL:**

   **Before:**

   ```typescript
   const API_BASE_URL = (import.meta as any).env.PROD
     ? (import.meta as any).env.VITE_API_URL ||
       "https://second-space-api.onrender.com"
     : "http://localhost:8080";
   ```

   **After:**

   ```typescript
   const API_BASE_URL = (import.meta as any).env.PROD
     ? "https://second-space-api-XXXX.onrender.com" // ← YOUR ACTUAL URL!
     : "http://localhost:8080";
   ```

4. **Save the file**

---

### Step 6: Update Backend CORS Settings (2 minutes)

Allow your backend to accept requests from production:

1. **Open `backend/app.js`**

2. **Find the `allowedOrigins` array** (around line 14-20)

3. **Add your Render backend URL:**

   **Before:**

   ```javascript
   const allowedOrigins = process.env.ALLOWED_ORIGINS
     ? process.env.ALLOWED_ORIGINS.split(",")
     : [
         "http://localhost:5173",
         "http://localhost:80",
         "http://localhost",
         "https://cfurley.github.io",
       ];
   ```

   **After:**

   ```javascript
   const allowedOrigins = process.env.ALLOWED_ORIGINS
     ? process.env.ALLOWED_ORIGINS.split(",")
     : [
         "http://localhost:5173",
         "http://localhost:80",
         "http://localhost",
         "https://cfurley.github.io",
         "https://second-space-api-XXXX.onrender.com", // ← ADD YOUR URL!
       ];
   ```

4. **Save the file**

---

### Step 7: Deploy Changes (3 minutes)

1. **Commit your changes:**

   ```bash
   git add frontend/src/utils/api.ts backend/app.js
   git commit -m "Configure production API URL and CORS for Render deployment"
   ```

2. **Push to GitHub:**

   ```bash
   # If still on feature branch:
   git push origin feature/backend-api-integration

   # Then merge to main via GitHub PR, OR:
   git checkout main
   git merge feature/backend-api-integration
   git push origin main
   ```

3. **Wait for deployments:**
   - **Frontend:** GitHub Actions deploys to GitHub Pages (~2-3 min)
     - Check: https://github.com/cfurley/second-space/actions
   - **Backend:** Render auto-deploys from main (~2-3 min)
     - Check: Render Dashboard → second-space-api → "Events" tab

---

### Step 8: Test Production! (5 minutes)

1. **Visit your live app:**

   ```
   https://cfurley.github.io/second-space/
   ```

2. **Open Browser DevTools** (Press F12)

   - Go to "Console" tab
   - Keep it open to see any errors

3. **Test the full flow:**

   - ✅ Click "Create Account"
   - ✅ Fill in all fields (first name, last name, username, password)
   - ✅ Complete human verification
   - ✅ Click "Create Account"
   - ✅ Should see success message!
   - ✅ Try logging in with your new account
   - ✅ Try creating a space

4. **Check for errors:**
   - Console should be clean (no red errors)
   - Network tab should show successful API calls (200/201 status codes)
   - If you see CORS errors, double-check Step 6

---

## ✅ Deployment Complete!

Your app is now live at:

- **Frontend:** https://cfurley.github.io/second-space/
- **Backend:** https://second-space-api-XXXX.onrender.com
- **Cost:** $0/month 🎉

---

## 🔧 Post-Deployment Configuration (Optional)

### Keep Backend Awake (Recommended)

Render's free tier "spins down" after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

**Option 1: UptimeRobot (Free, Recommended)**

1. Sign up at: https://uptimerobot.com
2. Click "Add New Monitor"
3. Settings:
   - Monitor Type: HTTP(s)
   - Friendly Name: Second Space API
   - URL: `https://your-backend-url.onrender.com`
   - Monitoring Interval: 5 minutes
4. Click "Create Monitor"

✅ Your backend now stays awake during the day!

**Option 2: Just Wake Before Use**

- Visit your backend URL 2 minutes before you need it
- It wakes in ~30 seconds and stays awake for 15 minutes

---

## 🗄️ Database Management

### Reset Database (Like `docker-compose down -v`)

If you need to wipe everything and start fresh:

```bash
# Use the reset script (make it executable first)
chmod +x database/reset.sh

# Run it (get DATABASE_URL from Render dashboard)
./database/reset.sh 'postgresql://user:pass@host/db?ssl=true'
```

### View Database Contents

```bash
# Connect to database
psql 'YOUR_DATABASE_URL'

# List all tables
\dt

# See all users
SELECT * FROM "user";

# Count spaces
SELECT COUNT(*) FROM space;

# Exit
\q
```

### Add Test Data

```bash
# Create some test users and spaces
psql 'YOUR_DATABASE_URL' << EOF
INSERT INTO "user" (username, password, first_name, last_name, display_name)
VALUES ('demo', 'Demo123!', 'Demo', 'User', 'demo');

INSERT INTO space (created_by_user_id, title, description)
VALUES (1, 'Demo Space', 'A demo space for testing');
EOF
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check build logs:**

- Render Dashboard → `second-space-api` → "Logs" tab
- Look for npm install errors or missing dependencies

**Common fix:**

```bash
# Make sure all dependencies are in package.json
cd backend
npm install
git add package.json package-lock.json
git commit -m "Update backend dependencies"
git push origin main
```

---

### CORS Errors in Browser

**Symptoms:**

- Console error: "blocked by CORS policy"
- API calls fail with CORS error

**Solution:**

1. Check `backend/app.js` has both URLs in `allowedOrigins`:
   ```javascript
   'https://cfurley.github.io',           // GitHub Pages
   'https://your-backend.onrender.com',   // Render backend
   ```
2. Commit and push to trigger redeploy

---

### "Failed to Fetch" Errors

**Symptoms:**

- Login/signup buttons don't work
- Console: "Failed to fetch"

**Check these:**

1. **Backend URL is correct** in `frontend/src/utils/api.ts`

   ```bash
   # Should match your Render URL exactly
   curl https://your-backend.onrender.com
   # Should return: {"message":"Second Space API",...}
   ```

2. **Backend is awake:**

   - Visit your backend URL in browser
   - Wait 30 seconds if it's spinning up
   - Should see JSON response

3. **Database is initialized:**
   ```bash
   psql 'YOUR_DATABASE_URL' -c "\dt"
   # Should show tables: user, space, theme, etc.
   ```

---

### Database Connection Fails

**Symptoms:**

- Backend logs show: "Connection refused" or "Database error"

**Solution:**

1. Check environment variables:
   - Render Dashboard → `second-space-api` → "Environment"
   - Should have: `DATABASE_URL` (auto-set by render.yaml)
2. If missing, reconnect services:
   - Dashboard → `second-space-api` → Settings
   - Scroll to "Environment Variables"
   - Add: `DATABASE_URL` from database connection string

---

### Frontend Shows Old Version

**Symptoms:**

- Changes don't appear on GitHub Pages
- Still seeing old API URL

**Solution:**

```bash
# Check GitHub Actions deployment
# Visit: https://github.com/cfurley/second-space/actions

# If failed, check:
# 1. package.json has no syntax errors
# 2. All imports are correct
# 3. Build runs locally: cd frontend && npm run build

# Force redeploy:
git commit --allow-empty -m "Trigger GitHub Pages redeploy"
git push origin main
```

---

### Database Tables Don't Exist

**Symptoms:**

- Can't log in
- Backend errors about missing tables
- SQL errors in logs

**Solution:**

```bash
# Re-run init script
psql 'YOUR_DATABASE_URL' -f database/init/init.sql

# Verify tables exist
psql 'YOUR_DATABASE_URL' -c "\dt"
```

---

## 📊 Quick Reference

### Important URLs

| Service              | URL                                             | Purpose            |
| -------------------- | ----------------------------------------------- | ------------------ |
| **Frontend**         | https://cfurley.github.io/second-space/         | Production app     |
| **Backend**          | https://your-app.onrender.com                   | API server         |
| **GitHub Actions**   | https://github.com/cfurley/second-space/actions | Deployment logs    |
| **Render Dashboard** | https://dashboard.render.com                    | Backend management |

### Important Files

| File                        | What It Does             | When to Edit                |
| --------------------------- | ------------------------ | --------------------------- |
| `frontend/src/utils/api.ts` | API base URL             | After deploying backend     |
| `backend/app.js`            | CORS allowed origins     | After deploying backend     |
| `render.yaml`               | Render deployment config | Change service names/config |
| `database/init/init.sql`    | Database schema          | Add new tables/columns      |
| `database/reset.sh`         | Database reset script    | Never (just run it)         |

### Common Commands

```bash
# Local development
docker-compose up --build              # Start everything
docker-compose down -v                 # Reset everything

# Database management
psql 'DB_URL' -f database/init/init.sql    # Initialize
psql 'DB_URL' -c "\dt"                     # List tables
./database/reset.sh 'DB_URL'               # Reset database

# Deployment
git push origin main                       # Deploy frontend & backend
git commit --allow-empty -m "Redeploy"     # Force redeploy

# Testing
curl https://your-backend.onrender.com     # Check backend
open https://cfurley.github.io/second-space/  # Open app
```

---

## 🎯 Deployment Checklist

Use this to make sure everything is configured:

### Pre-Deployment

- [ ] Local Docker setup works
- [ ] Tests pass (`npm test` in frontend and backend)
- [ ] All changes committed and pushed
- [ ] Feature branch merged to main

### Render Setup

- [ ] Render account created (signed up with GitHub)
- [ ] Blueprint deployed from render.yaml
- [ ] Backend service is "Live" (check dashboard)
- [ ] Database service is "Available"
- [ ] Database initialized with init.sql
- [ ] Backend URL copied and saved

### Code Updates

- [ ] Frontend API URL updated in `api.ts`
- [ ] Backend CORS updated in `app.js`
- [ ] Changes committed and pushed to main

### Testing

- [ ] GitHub Pages deployed successfully
- [ ] Render backend deployed successfully
- [ ] Can visit frontend URL
- [ ] Can create an account
- [ ] Can log in
- [ ] Can create a space
- [ ] No console errors

### Optional

- [ ] UptimeRobot monitor set up
- [ ] Team members added to Render project
- [ ] Environment variables documented

---

## 🎉 You're Done!

Your app is now fully deployed and accessible worldwide at:

- **https://cfurley.github.io/second-space/**

**Cost:** $0/month

**Next steps:**

- Share the URL with your team
- Start building new features
- Add more tests
- Consider upgrading to paid tier before presentation week (optional)

---

## 🆘 Need Help?

1. **Check logs first:**

   - Backend: Render Dashboard → Logs
   - Frontend: GitHub Actions → Workflow runs
   - Browser: F12 → Console tab

2. **Review documentation:**

   - PROJECT_OVERVIEW.md - Complete project guide
   - INTEGRATION_GUIDE.md - Technical deep dive
   - README.md - Quick start guide

3. **Common issues:**

   - All covered in Troubleshooting section above
   - Check if backend is awake (free tier spins down)
   - Verify CORS settings match your URLs exactly

4. **Still stuck?**
   - Check Render community: https://community.render.com
   - Review GitHub Actions logs for deployment errors
   - Make sure database is initialized

---

**Good luck with your deployment tonight!** 🚀

_Last updated: October 27, 2025_
