# Security Changes - Password Hashing Implementation

**Date:** November 24, 2025  
**Branch:** AT  
**Author:** Security Update

---

## Summary

Implemented secure password hashing using **bcryptjs** to replace plain-text password storage. This is a critical security improvement.

---

## What Changed

### 1. Database Connection (`src/db/index.js`)
- **Removed** hardcoded fallback credentials (`myuser`, `mypassword`, etc.)
- **Added** fail-fast validation - app won't start if DB credentials are missing
- **No action needed** if using Docker Compose (credentials are set in `docker-compose.yaml`)

### 2. New Password Service (`src/services/passwordService.js`) ⭐ NEW FILE
- `hashPassword(plainText)` - Hashes passwords with bcryptjs (12 rounds)
- `validatePassword(plainText, hash)` - Securely compares passwords

### 3. User Services (`src/services/userServices.js`)
Three functions were updated:

| Function | What Changed |
|----------|--------------|
| `authenticateLogin()` | Now fetches user by username, then validates password with bcryptjs |
| `updatePassword()` | Hashes password before storing in database |
| `createUser()` | Hashes password before storing; no longer returns password in response |

### 4. Dependencies (`package.json`)
- **Added:** `bcryptjs` package (pure JavaScript, no native compilation required)

### 5. Environment Config (`.env.example`)
- Documents required environment variables

---

## ⚠️ Important: Existing Users

**Existing users with plain-text passwords will NOT be able to log in** until their passwords are re-hashed.

### How to Fix Test Users:

**Option A: Reset via API** (Recommended)
```bash
# Create a new user with hashed password
curl -X POST http://localhost:8080/user \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Password123","first_name":"Test","last_name":"User"}'
```

**Option B: Update init.sql**  
Replace plain-text passwords in `database/init/init.sql` with bcrypt hashes, then reset the database.

---

## How to Test

1. **Start with Docker Compose** (no changes needed):
   ```bash
   docker-compose up --build
   ```

2. **Create a new user:**
   ```bash
   curl -X POST http://localhost:8080/user \
     -H "Content-Type: application/json" \
     -d '{"username":"newuser","password":"SecurePass123","first_name":"New","last_name":"User"}'
   ```

3. **Login with the new user:**
   ```bash
   curl -X POST http://localhost:8080/user/authentication \
     -H "Content-Type: application/json" \
     -d '{"username":"newuser","password":"SecurePass123"}'
   ```

---

## Files Changed

```
backend/
├── package.json                    # Added bcrypt dependency
├── .env.example                    # Removed default credentials  
├── SECURITY_CHANGELOG.md           # This file (NEW)
└── src/
    ├── db/
    │   └── index.js                # Fail-fast credential validation
    └── services/
        ├── passwordService.js      # NEW - bcrypt hash/validate
        └── userServices.js         # Updated 3 functions
```

---

## For Backend Developers

### Running Locally (without Docker)

If you need to run the backend outside of Docker:

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=myuser
   DB_PASSWORD=mypassword
   DB_NAME=mydatabase
   ```

3. Make sure PostgreSQL is running and accessible

4. Start the backend:
   ```bash
   npm start
   ```

### Running with Docker (Recommended)

No changes needed! Just run:
```bash
docker-compose up --build
```

The credentials are already configured in `docker-compose.yaml`.

---

## Security Notes

- Passwords are now hashed with **bcrypt (12 rounds)** - industry standard
- Plain-text passwords are **never stored** in the database
- Password hashes are **never returned** in API responses
- The app **fails immediately** if database credentials are missing (fail-fast security)
