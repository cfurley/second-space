// Simple in-memory authentication attempt tracker
// Keyed by identifier (username or IP). For production, use persistent store (Redis)
const STORAGE = new Map();

const WARNING_ATTEMPT_NUMBER = 4;
const LOCKOUT_ATTEMPT_NUMBER = 5;
const BASE_TIMEOUT_MINUTES = 1; // base timeout in minutes

function nowMs() {
  return Date.now();
}

function getDefault() {
  return {
    count: 0,
    lockoutCount: 0,
    timeoutUntil: null,
    lastAttempt: null,
  };
}

function getRecord(id) {
  if (!STORAGE.has(id)) STORAGE.set(id, getDefault());
  return STORAGE.get(id);
}

function calculateTimeoutMinutes(lockoutCount) {
  // Progressive: 1,2,3,... minutes
  return Math.max(1, lockoutCount);
}

function isTimeoutActive(rec) {
  return rec.timeoutUntil && rec.timeoutUntil > nowMs();
}

function remainingMs(rec) {
  if (!rec.timeoutUntil) return 0;
  return Math.max(0, rec.timeoutUntil - nowMs());
}

/**
 * Check if identifier is currently locked.
 * identifier should be username or req.ip.
 */
function checkLockout(identifier) {
  const rec = getRecord(identifier);
  if (isTimeoutActive(rec)) {
    return { locked: true, remainingMs: remainingMs(rec), lockoutCount: rec.lockoutCount };
  }
  return { locked: false, remainingMs: 0, lockoutCount: rec.lockoutCount };
}

/**
 * Record a failed attempt and return info about whether to lock out now
 */
function recordFailedAttempt(identifier) {
  const rec = getRecord(identifier);
  rec.count = (rec.count || 0) + 1;
  rec.lastAttempt = nowMs();

  // If already had a timeout that expired, keep lockoutCount so timeouts escalate
  if (rec.count >= LOCKOUT_ATTEMPT_NUMBER) {
    // enforce timeout
    rec.lockoutCount = (rec.lockoutCount || 0) + 1;
    const minutes = calculateTimeoutMinutes(rec.lockoutCount);
    rec.timeoutUntil = nowMs() + minutes * 60 * 1000;
    // set count to 0 so subsequent attempts during timeout are irrelevant
    rec.count = 0;
    return { shouldLock: true, timeoutMinutes: minutes, lockoutCount: rec.lockoutCount };
  }

  // If this is the warning attempt
  if (rec.count === WARNING_ATTEMPT_NUMBER) {
    return { shouldWarn: true, attemptsLeft: LOCKOUT_ATTEMPT_NUMBER - rec.count };
  }

  return { shouldLock: false, shouldWarn: false, attemptsLeft: LOCKOUT_ATTEMPT_NUMBER - rec.count };
}

function resetAttempts(identifier) {
  STORAGE.set(identifier, getDefault());
}

// Expose for tests and admin
export default {
  checkLockout,
  recordFailedAttempt,
  resetAttempts,
  // internals for troubleshooting
  _STORAGE: STORAGE,
};
