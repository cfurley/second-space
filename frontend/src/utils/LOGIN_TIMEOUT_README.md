# Login Timeout Feature

## Overview
This feature implements a progressive security measure for failed login attempts. It warns users after multiple failed attempts and enforces an escalating lockout period to prevent brute-force attacks.

## How It Works

### Attempt Tracking
The system tracks failed login attempts using browser localStorage:
- Each failed login increments the attempt counter
- Successful login resets all counters to zero
- The timeout state persists across page refreshes
- Lockout count tracks how many times the user has been locked out

### Warning Stage (4th Failed Attempt)
After **3 failed attempts**, the user receives a warning on their **4th failure**:
- A yellow warning banner appears at the top of the login form
- Message shows the next timeout duration (progressively increases)
- Example: "⚠️ Warning: One more failed attempt will lock you out for X minute(s)."
- User can still attempt to login

### Progressive Timeout Stage (5th+ Failed Attempts)
After **4 failed attempts**, the user is locked out on their **5th failure** with **escalating timeouts**:

**First Lockout (5th attempt):** 1 minute timeout
**Second Lockout (6th attempt after first timeout):** 2 minutes timeout
**Third Lockout (7th attempt after second timeout):** 3 minutes timeout
**And so on...** Each subsequent lockout adds one more minute

- A red error banner appears showing the remaining timeout duration
- The submit button is disabled and shows the countdown timer
- Message: "🔒 Account Temporarily Locked: Too many failed login attempts. Please wait [time] before trying again."

### Countdown Timer
While locked out:
- A real-time countdown displays the remaining time in MM:SS format (e.g., "1:45", "2:30")
- The submit button text changes to show the countdown
- The form remains visible but non-functional

### Post-Timeout Behavior
After the timeout expires:
- The lockout is automatically removed
- The attempt counter resets to zero (but lockout count is preserved)
- User can try logging in again
- **If they fail again, they get the NEXT progressive timeout**
  - Example: After 1-min timeout expires, next failure = 2-min timeout

### Additional Failed Attempts During Timeout
If a user somehow attempts to login during an active timeout period:
- The timeout duration is **increased to the next level**
- Example: During a 2-minute timeout, another attempt extends it to 3 minutes
- The attempt counter increments
- This prevents bypassing the security measure and adds stronger deterrence

## Files

### New Files Created

1. **`frontend/src/utils/loginTimeout.ts`**
   - Core logic for managing login timeouts
   - Functions:
     - `checkTimeout()` - Check if user is currently in timeout
     - `recordFailedAttempt()` - Record a failed login and return status
     - `resetAttempts()` - Clear attempts on successful login
     - `formatTimeRemaining()` - Format seconds as MM:SS
     - `getAttemptCount()` - Get current attempt count

2. **`frontend/src/utils/__tests__/loginTimeout.test.ts`**
   - Comprehensive unit tests for the timeout functionality
   - Tests cover all scenarios including edge cases

### Modified Files

1. **`frontend/src/components/login.tsx`**
   - Integrated timeout checking before login submission
   - Added warning and timeout UI components
   - Added state management for timeout status
   - Added countdown timer effect
   - Disabled submit button during timeout
   - Reset attempts on successful login

## Usage

The feature works automatically once integrated. No additional configuration is needed.

### For Users
1. Users will see warnings when approaching the lockout threshold
2. After too many failures, they must wait 1 minute before trying again
3. The countdown timer provides clear feedback on remaining wait time

### For Developers
To use the timeout functions in other components:

```typescript
import {
  checkTimeout,
  recordFailedAttempt,
  resetAttempts,
  formatTimeRemaining,
} from '../utils/loginTimeout';

// Check if user is timed out
const { isTimedOut, remainingSeconds } = checkTimeout();

// Record a failed attempt
const result = recordFailedAttempt();
if (result.shouldShowWarning) {
  // Show warning to user
}
if (result.shouldTimeout) {
  // Start timeout UI
}

// On successful login
resetAttempts();
```

## Configuration

The timeout parameters can be adjusted in `loginTimeout.ts`:

```typescript
export const BASE_TIMEOUT_DURATION_MS = 60 * 1000; // 1 minute base (progressive multiplier)
export const WARNING_ATTEMPT_NUMBER = 4; // Show warning on 4th attempt
export const LOCKOUT_ATTEMPT_NUMBER = 5; // Lock after 5th attempt
```

**Progressive Timeout Calculation:**
- 1st lockout: 1 × BASE_TIMEOUT_DURATION_MS = 1 minute
- 2nd lockout: 2 × BASE_TIMEOUT_DURATION_MS = 2 minutes
- 3rd lockout: 3 × BASE_TIMEOUT_DURATION_MS = 3 minutes
- And so on...

## Security Considerations

1. **Client-Side Only**: This implementation uses localStorage and is client-side only. For production, consider:
   - Server-side attempt tracking
   - IP-based rate limiting
   - CAPTCHA after multiple failures
   - Account lockout with email verification

2. **Bypass Methods**: Users can potentially bypass by:
   - Clearing localStorage
   - Using incognito/private browsing
   - Using different browsers
   
   For production, implement server-side tracking.

3. **UX Balance**: The 1-minute timeout balances security with user experience. Adjust based on your security requirements.

## Testing

Run the tests with:
```bash
npm test loginTimeout.test.ts
```

The tests cover:
- Timeout checking and expiration
- Failed attempt counting
- Warning triggers
- Timeout enforcement
- Counter reset behavior
- Time formatting

## Future Enhancements

Potential improvements:
1. Server-side attempt tracking
2. Progressive timeout increases (1 min, 5 min, 15 min, etc.)
3. Email notifications for repeated failures
4. Admin dashboard for monitoring failed attempts
5. IP-based tracking and blocking
6. Integration with CAPTCHA systems
7. Account recovery mechanisms
