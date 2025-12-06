/**
 * Login Timeout Manager
 * 
 * Progressive security measure to prevent brute-force attacks.
 * Uses localStorage to persist attempt tracking across sessions.
 * 
 * Security rationale:
 * - Client-side tracking provides immediate feedback without server round-trips
 * - Progressive timeouts increase security: 1 min, 2 min, 3 min, etc.
 * - Each failed attempt after lockout adds another minute
 * - Warning system prevents legitimate users from accidental lockouts
 */

// Configuration constants - exported for testing and reusability
export const STORAGE_KEY = 'ss_login_attempts';
export const BASE_TIMEOUT_DURATION_MS = 60 * 1000; // 1 minute base
export const WARNING_ATTEMPT_NUMBER = 4; // Show warning on this attempt
export const LOCKOUT_ATTEMPT_NUMBER = 5; // Enforce timeout starting at this attempt

interface LoginAttemptData {
  count: number;
  timeoutUntil: number | null; // timestamp when timeout expires
  lastAttempt: number; // timestamp of last attempt
  lockoutCount: number; // number of times user has been locked out (for progressive timeout)
}

/**
 * Data Access Layer - Centralized localStorage operations
 * Provides consistent error handling and data validation
 */

function getDefaultAttemptData(): LoginAttemptData {
  return {
    count: 0,
    timeoutUntil: null,
    lastAttempt: 0,
    lockoutCount: 0,
  };
}

function getAttemptData(): LoginAttemptData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultAttemptData();
    }
    
    const parsed = JSON.parse(stored);
    // Validate parsed data structure to prevent corruption
    if (typeof parsed.count !== 'number' || typeof parsed.lastAttempt !== 'number') {
      return getDefaultAttemptData();
    }
    
    return parsed;
  } catch (e) {
    console.error('Error reading login attempt data:', e);
    return getDefaultAttemptData();
  }
}

function saveAttemptData(data: LoginAttemptData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving login attempt data:', e);
  }
}

function clearAttemptData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing login attempt data:', e);
  }
}

/**
 * Business Rule Helpers - Isolated decision logic
 */

function isTimeoutActive(timeoutUntil: number | null, currentTime: number): boolean {
  return timeoutUntil !== null && timeoutUntil > currentTime;
}

function hasTimeoutExpired(timeoutUntil: number | null, currentTime: number): boolean {
  return timeoutUntil !== null && timeoutUntil <= currentTime;
}

function shouldShowWarning(attemptCount: number): boolean {
  return attemptCount === WARNING_ATTEMPT_NUMBER;
}

function shouldEnforceTimeout(attemptCount: number): boolean {
  return attemptCount >= LOCKOUT_ATTEMPT_NUMBER;
}

function calculateRemainingAttempts(attemptCount: number): number {
  return Math.max(0, LOCKOUT_ATTEMPT_NUMBER - attemptCount);
}

/**
 * Calculate progressive timeout duration
 * First lockout: 1 minute
 * Second lockout: 2 minutes
 * Third lockout: 3 minutes, etc.
 */
function calculateTimeoutDuration(lockoutCount: number): number {
  const minutes = Math.max(1, lockoutCount);
  return minutes * BASE_TIMEOUT_DURATION_MS;
}

/**
 * Public API Functions
 */

export function checkTimeout(): { isTimedOut: boolean; remainingSeconds: number } {
  const data = getAttemptData();
  const now = Date.now();
  
  // Early return if no timeout set
  if (!data.timeoutUntil) {
    return { isTimedOut: false, remainingSeconds: 0 };
  }
  
  // If timeout expired, clear it and update localStorage
  if (!isTimeoutActive(data.timeoutUntil, now)) {
    clearExpiredTimeout(data);
    return { isTimedOut: false, remainingSeconds: 0 };
  }
  
  const remainingMs = data.timeoutUntil - now;
  return {
    isTimedOut: true,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
}

/**
 * Handle failed attempt during active timeout
 * Increases lockout count and applies progressive timeout
 * Each subsequent lockout adds one more minute
 */
function handleAttemptDuringTimeout(data: LoginAttemptData, now: number): {
  shouldShowWarning: boolean;
  shouldTimeout: boolean;
  attemptCount: number;
  remainingAttempts: number;
} {
  // Increment lockout count for progressive timeout
  data.lockoutCount += 1;
  const timeoutDuration = calculateTimeoutDuration(data.lockoutCount);
  
  data.timeoutUntil = now + timeoutDuration;
  data.count += 1;
  data.lastAttempt = now;
  saveAttemptData(data);
  
  return {
    shouldShowWarning: false,
    shouldTimeout: true,
    attemptCount: data.count,
    remainingAttempts: 0,
  };
}

/**
 * Reset attempt counter after timeout expires
 * Note: lockoutCount is preserved to maintain progressive timeout
 * If user has been locked out before, set count to 4 so next attempt triggers lockout
 */
function clearExpiredTimeout(data: LoginAttemptData): void {
  data.timeoutUntil = null;
  
  // If user has been locked out before, set count to 4
  // This makes the NEXT failed attempt (5th total) trigger immediate lockout
  if (data.lockoutCount > 0) {
    data.count = LOCKOUT_ATTEMPT_NUMBER - 1; // Set to 4, so next attempt is 5th
  } else {
    data.count = 0;
  }
  
  // Save the updated data to localStorage
  saveAttemptData(data);
}

/**
 * Process a new failed attempt
 * Applies first-time lockout or increments lockout count
 */
function processNewFailedAttempt(data: LoginAttemptData, now: number): {
  shouldShowWarning: boolean;
  shouldTimeout: boolean;
  attemptCount: number;
  remainingAttempts: number;
} {
  data.count += 1;
  data.lastAttempt = now;
  
  const showWarning = shouldShowWarning(data.count);
  const enforceTimeout = shouldEnforceTimeout(data.count);
  
  if (enforceTimeout) {
    // Increment lockout count and apply progressive timeout
    data.lockoutCount += 1;
    const timeoutDuration = calculateTimeoutDuration(data.lockoutCount);
    data.timeoutUntil = now + timeoutDuration;
  }
  
  saveAttemptData(data);
  
  return {
    shouldShowWarning: showWarning,
    shouldTimeout: enforceTimeout,
    attemptCount: data.count,
    remainingAttempts: calculateRemainingAttempts(data.count),
  };
}

export function recordFailedAttempt(): {
  shouldShowWarning: boolean;
  shouldTimeout: boolean;
  attemptCount: number;
  remainingAttempts: number;
} {
  const data = getAttemptData();
  const now = Date.now();
  
  // Early return: Handle attempt during active timeout
  if (isTimeoutActive(data.timeoutUntil, now)) {
    return handleAttemptDuringTimeout(data, now);
  }
  
  // Clear expired timeout before processing new attempt
  if (hasTimeoutExpired(data.timeoutUntil, now)) {
    clearExpiredTimeout(data);
  }
  
  return processNewFailedAttempt(data, now);
}

export function resetAttempts(): void {
  clearAttemptData();
}

export function getAttemptCount(): number {
  const data = getAttemptData();
  return data.count;
}

export function getLockoutCount(): number {
  const data = getAttemptData();
  return data.lockoutCount;
}

export function getTimeoutMinutes(): number {
  const data = getAttemptData();
  return Math.max(1, data.lockoutCount);
}

export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
