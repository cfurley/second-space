/**
 * Login Timeout Manager
 * 
 * Tracks failed login attempts and enforces timeout penalties.
 * - After 4 failed attempts, shows a warning
 * - After 5 failed attempts, enforces a 1-minute timeout
 * - Each subsequent failure after timeout adds another 1-minute timeout
 */

const TIMEOUT_DURATION = 60 * 1000; // 1 minute in milliseconds
const STORAGE_KEY = 'ss_login_timeout';
const ATTEMPTS_KEY = 'ss_login_attempts';

interface TimeoutData {
  lockedUntil: number; // Timestamp when the user can try again
  attempts: number;     // Number of failed attempts
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
  return { lockedUntil: 0, attempts: 0 };
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
 * Returns the updated timeout state
 */
export function recordFailedAttempt(): TimeoutData {
  const state = getTimeoutState();
  const now = Date.now();
  
  // If we're past a previous lockout, reset the counter
  if (state.lockedUntil > 0 && state.lockedUntil < now) {
    // User had a timeout but it expired - they get fresh attempts
    state.attempts = 0;
    state.lockedUntil = 0;
  }
  
  // Increment attempts
  state.attempts += 1;
  
  // If this is the 5th attempt or any attempt after being locked out, apply timeout
  if (state.attempts >= 5) {
    state.lockedUntil = now + TIMEOUT_DURATION;
  }
  
  saveTimeoutState(state);
  return state;
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
