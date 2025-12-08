# Backend Authentication Lockout

## Overview

The backend now enforces **server-side progressive authentication lockout** to prevent brute-force attacks. This works independently of the frontend timeout logic and cannot be bypassed by scripts or API calls.

## Implementation

### Files Created/Modified

1. **`backend/src/services/authenticationServices.js`** (NEW)
   - In-memory tracking of failed login attempts per identifier (username or IP)
   - Progressive timeout logic: 1 min, 2 min, 3 min, etc.
   - Functions: `checkLockout()`, `recordFailedAttempt()`, `resetAttempts()`

2. **`backend/src/controllers/userControllers.js`** (MODIFIED)
   - `authenticate()` method now checks lockout status before authentication
   - Records failed attempts after authentication fails
   - Returns HTTP 429 (Too Many Requests) when locked out
   - Resets attempts on successful login

## How It Works

### Attempt Tracking
- Tracks attempts by **identifier**: username (preferred) or IP address (fallback)
- Uses in-memory Map (for production, migrate to Redis or database)

### Progressive Lockout Logic
1. **Attempts 1-3**: Normal authentication, no warnings
2. **Attempt 4**: Warning threshold (not exposed to prevent info leakage)
3. **Attempt 5**: First lockout - 1 minute timeout
4. **After timeout expires + Attempt 1**: Second lockout - 2 minute timeout
5. **After timeout expires + Attempt 1**: Third lockout - 3 minute timeout
6. And so on... (progressive escalation)

### Security Features
- **Cannot be bypassed**: Server-side enforcement means no client-side manipulation
- **Prevents info leakage**: Returns generic "Invalid Login" error, not "locked out" until actually locked
- **Progressive escalation**: Each subsequent lockout adds 1 more minute
- **Immediate lockout after timeout**: After a timeout expires, the very next failed attempt triggers the next lockout level

### HTTP Responses

**Normal failed login (attempts 1-4):**
```json
HTTP 404
{ "error": "Invalid Login" }
```

**Locked out (attempt 5+):**
```json
HTTP 429
{ "error": "Too many login attempts. Try again in 1 minute(s)." }
```

**Successful login:**
```json
HTTP 200
{ id, username, display_name, ... }
```

## Testing

### Manual Test Script

Run `test-backend-lockout.bat` to test the lockout:

```bash
# Make sure backend is running on port 8080
test-backend-lockout.bat
```

Expected behavior:
- Attempts 1-4: Return `{"error":"Invalid Login"}` with HTTP 404
- Attempt 5: Returns `{"error":"Too many login attempts. Try again in 1 minute(s)."}` with HTTP 429
- Attempt 6 (immediate): Returns HTTP 429 with remaining time

### cURL Examples

```bash
# Test 5 failed attempts
for i in {1..5}; do
  curl -X POST http://localhost:8080/user/authentication \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"testuser\",\"password\":\"wrong$i\"}"
  echo ""
done

# This should return 429
curl -X POST http://localhost:8080/user/authentication \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"wrong6\"}"
```

### Verifying Progressive Timeouts

1. Trigger 5 failed attempts → 1 minute lockout
2. Wait 1 minute
3. Attempt again → 2 minute lockout (immediate, no need for 5 more attempts)
4. Wait 2 minutes
5. Attempt again → 3 minute lockout
6. And so on...

## Production Considerations

### Current Implementation (Development)
- Uses in-memory `Map()` for attempt tracking
- Data lost on server restart
- Not shared across multiple server instances

### Production Recommendations

1. **Use Redis** for distributed attempt tracking:
   ```javascript
   // Replace Map with Redis
   import Redis from 'ioredis';
   const redis = new Redis();
   
   // Store attempts with TTL
   await redis.setex(`auth:${identifier}`, timeoutSeconds, JSON.stringify(data));
   ```

2. **Add rate limiting middleware** (e.g., express-rate-limit)

3. **Log suspicious activity**:
   ```javascript
   if (rec.lockoutCount > 3) {
     logger.warn(`Suspicious activity: ${identifier} locked out ${rec.lockoutCount} times`);
   }
   ```

4. **Consider CAPTCHA** after multiple lockouts

5. **Add admin endpoint** to reset attempts:
   ```javascript
   // Admin route to clear lockouts
   app.post('/admin/reset-lockout', adminAuth, (req, res) => {
     authenticationService.resetAttempts(req.body.identifier);
   });
   ```

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /user/authentication
       ▼
┌─────────────────────────────┐
│  userControllers.js         │
│  authenticate()             │
└──────┬──────────────────────┘
       │
       ├─► authenticationService.checkLockout()
       │   └─► Is locked? Return 429
       │
       ├─► userService.authenticateLogin()
       │   └─► Check username/password
       │
       ├─► If failed:
       │   └─► authenticationService.recordFailedAttempt()
       │       └─► Count >= 5? Lock & Return 429
       │
       └─► If success:
           └─► authenticationService.resetAttempts()
```

## Compatibility with Frontend

- Frontend `loginTimeout.ts` provides **user-friendly** countdown UI
- Backend `authenticationServices.js` provides **security enforcement**
- Both work together but independently:
  - Frontend: localStorage-based, can be cleared by user
  - Backend: Server-side, cannot be bypassed

**Best practice**: Keep both! Frontend provides better UX, backend ensures security.

## Configuration

Constants in `authenticationServices.js`:

```javascript
const WARNING_ATTEMPT_NUMBER = 4;    // Show warning (not exposed currently)
const LOCKOUT_ATTEMPT_NUMBER = 5;    // Trigger lockout
const BASE_TIMEOUT_MINUTES = 1;      // Base timeout duration
```

Adjust these values based on security requirements.

## Troubleshooting

### "How do I unlock a user?"

Currently requires server restart. For production, add admin endpoint:

```javascript
// In authenticationServices.js
function adminResetAttempts(identifier) {
  STORAGE.delete(identifier);
}
```

### "Lockout persists after valid login"

Check logs for errors in `resetAttempts()`. This should never happen as successful login clears the counter.

### "Can't reproduce lockout in tests"

Make sure you're using the same identifier (username). Different usernames have separate counters.

## Related Files

- Frontend: `frontend/src/utils/loginTimeout.ts`
- Frontend: `frontend/src/components/login.tsx`
- Backend: `backend/src/services/authenticationServices.js` ⭐ NEW
- Backend: `backend/src/controllers/userControllers.js` ⭐ MODIFIED
