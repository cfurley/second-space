/**
 * Login Timeout Manager
 * 
 * Tracks failed login attempts and enforces escalating timeout penalties.
 * - After 4 failed attempts, shows a warning
 * - After 5 failed attempts, enforces a 1-minute timeout
 * - Each subsequent failure after a timeout increases the duration:
 *   - 1st lockout: 1 minute
 *   - 2nd lockout: 2 minutes
 *   - 3rd lockout: 3 minutes
 *   - And so on...
 */

const BASE_TIMEOUT_DURATION = 60 * 1000; // 1 minute in milliseconds
const STORAGE_KEY = 'ss_login_timeout';
const ATTEMPTS_KEY = 'ss_login_attempts';

interface TimeoutData {
  lockedUntil: number;   // Timestamp when the user can try again
  attempts: number;      // Number of failed attempts
  lockoutCount: number;  // Number of times user has been locked out (for escalation)
}

/**
 * Get the current timeout state from localStorage
 */
export function getTimeoutState(): TimeoutData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading timeout state:', e);
  }
  return { lockedUntil: 0, attempts: 0, lockoutCount: 0 };
}

/**
 * Save the timeout state to localStorage
 */
function saveTimeoutState(data: TimeoutData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving timeout state:', e);
  }
}

/**
 * Check if the user is currently locked out
 * Returns the remaining time in milliseconds, or 0 if not locked
 */
export function getRemainingLockoutTime(): number {
  const state = getTimeoutState();
  const now = Date.now();
  
  if (state.lockedUntil > now) {
    return state.lockedUntil - now;
  }
  
  return 0;
}

/**
 * Check if the user is currently locked out
 */
export function isLockedOut(): boolean {
  return getRemainingLockoutTime() > 0;
}

/**
 * Record a failed login attempt
 * Returns the updated timeout state (immutable - creates new state object)
 * Implements escalating timeouts: 1min, 2min, 3min, etc.
 */
export function recordFailedAttempt(): TimeoutData {
  const currentState = getTimeoutState();
  const now = Date.now();
  
  // If we're past a previous lockout, this is a new attempt after timeout expired
  if (currentState.lockedUntil > 0 && currentState.lockedUntil < now) {
    // User had a timeout but it expired - this failure triggers escalated lockout
    const newLockoutCount = currentState.lockoutCount + 1;
    const escalatedTimeout = BASE_TIMEOUT_DURATION * newLockoutCount;
    
    const escalatedState: TimeoutData = {
      attempts: 1, // Reset attempts counter after lockout
      lockedUntil: now + escalatedTimeout,
      lockoutCount: newLockoutCount,
    };
    saveTimeoutState(escalatedState);
    return escalatedState;
  }
  
  // Increment attempts (immutable pattern)
  const newAttempts = currentState.attempts + 1;
  
  // If this is the 5th attempt, apply first timeout
  if (newAttempts >= 5) {
    const newLockoutCount = currentState.lockoutCount + 1;
    const timeoutDuration = BASE_TIMEOUT_DURATION * newLockoutCount;
    
    const newState: TimeoutData = {
      attempts: newAttempts,
      lockedUntil: now + timeoutDuration,
      lockoutCount: newLockoutCount,
    };
    saveTimeoutState(newState);
    return newState;
  }
  
  // Less than 5 attempts - just increment
  const newState: TimeoutData = {
    ...currentState,
    attempts: newAttempts,
  };
  saveTimeoutState(newState);
  return newState;
}

/**
 * Check if user should see a warning (on 4th attempt)
 */
export function shouldShowWarning(): boolean {
  const state = getTimeoutState();
  return state.attempts === 4 && !isLockedOut();
}

/**
 * Reset the login attempts (call after successful login)
 */
export function resetAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch (e) {
    console.error('Error resetting attempts:', e);
  }
}

/**
 * Get the number of failed attempts
 */
export function getAttemptCount(): number {
  const state = getTimeoutState();
  return state.attempts;
}

/**
 * Get the current lockout count (for escalating timeouts)
 */
export function getLockoutCount(): number {
  const state = getTimeoutState();
  return state.lockoutCount;
}

/**
 * Format remaining time in a human-readable way
 */
export function formatRemainingTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m`;
  }
  
  return `${seconds}s`;
}
