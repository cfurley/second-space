# Login Timeout Feature

## Overview
This feature implements a security mechanism to prevent brute-force login attempts by enforcing timeouts after multiple failed login attempts.

## How It Works

### Attempt Tracking
- The system tracks failed login attempts in the browser's localStorage
- Each failed login increments the attempt counter
- Successful logins reset the counter to zero

### Timeout Rules
1. **Attempts 1-3**: Normal login behavior with error messages
2. **Attempt 4**: Warning message appears: "⚠️ Warning: One more failed attempt will result in a 1-minute timeout."
3. **Attempt 5**: User is locked out for 1 minute
4. **After Timeout**: If the user fails again after the timeout expires, they receive another 1-minute timeout
5. **Successful Login**: Resets all counters and removes any timeouts

### User Experience
- **Visual Warning**: After 4 failed attempts, a yellow warning banner appears
- **Lockout State**: After 5 failed attempts:
  - Red lockout banner displays with countdown timer
  - Login button is disabled and shows remaining time
  - Password input field is disabled
  - Real-time countdown updates every 100ms
- **Recovery**: After the timeout expires, the user can attempt to login again

## Files

### `frontend/src/utils/loginTimeout.ts`
Core logic for timeout management:
- `getTimeoutState()`: Retrieves current timeout state from localStorage
- `isLockedOut()`: Checks if user is currently locked out
- `getRemainingLockoutTime()`: Returns milliseconds until lockout expires
- `recordFailedAttempt()`: Increments attempt counter and applies timeout if needed
- `shouldShowWarning()`: Returns true if user has 4 failed attempts
- `resetAttempts()`: Clears all timeout data (call after successful login)
- `getAttemptCount()`: Returns current number of failed attempts
- `formatRemainingTime()`: Formats milliseconds into human-readable time (e.g., "1m 23s")

### `frontend/src/components/login.tsx`
Updated login component with timeout integration:
- Checks lockout status on modal open
- Real-time countdown timer with useEffect
- Disabled form inputs during lockout
- Visual warning and lockout banners
- Integration with login submission handler

## Testing

Run the tests with:
```bash
npm test -- loginTimeout
```

Test file: `frontend/src/utils/__tests__/loginTimeout.test.ts`

## Configuration

To modify the timeout duration, edit the constant in `loginTimeout.ts`:
```typescript
const TIMEOUT_DURATION = 60 * 1000; // Currently 1 minute
```

## Storage Keys
- `ss_login_timeout`: Stores timeout state (attempts and lockout timestamp)
- `ss_login_attempts`: Legacy key (now consolidated into ss_login_timeout)

## Security Considerations
- Timeout data is stored in localStorage (client-side)
- For production, consider implementing server-side rate limiting
- This feature is a UX enhancement and deterrent, not a complete security solution
- Users can bypass by clearing localStorage, but this still provides protection against automated attacks

## Future Enhancements
- Escalating timeouts (2 min, 5 min, etc.)
- Server-side validation and IP-based rate limiting
- CAPTCHA integration after multiple failures
- Email notification of suspicious login attempts
