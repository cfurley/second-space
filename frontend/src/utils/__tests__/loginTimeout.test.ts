import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTimeoutState,
  getRemainingLockoutTime,
  isLockedOut,
  recordFailedAttempt,
  shouldShowWarning,
  resetAttempts,
  getAttemptCount,
  formatRemainingTime,
} from '../loginTimeout';

describe('Login Timeout Manager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllTimers();
  });

  it('should start with no timeout', () => {
    expect(isLockedOut()).toBe(false);
    expect(getAttemptCount()).toBe(0);
    expect(shouldShowWarning()).toBe(false);
  });

  it('should track failed attempts', () => {
    recordFailedAttempt();
    expect(getAttemptCount()).toBe(1);

    recordFailedAttempt();
    expect(getAttemptCount()).toBe(2);
  });

  it('should show warning on 4th attempt', () => {
    recordFailedAttempt();
    recordFailedAttempt();
    recordFailedAttempt();
    expect(shouldShowWarning()).toBe(false);
    
    recordFailedAttempt();
    expect(getAttemptCount()).toBe(4);
    expect(shouldShowWarning()).toBe(true);
    expect(isLockedOut()).toBe(false);
  });

  it('should lock out on 5th attempt', () => {
    recordFailedAttempt();
    recordFailedAttempt();
    recordFailedAttempt();
    recordFailedAttempt();
    recordFailedAttempt();

    expect(getAttemptCount()).toBe(5);
    expect(isLockedOut()).toBe(true);
    expect(getRemainingLockoutTime()).toBeGreaterThan(0);
  });

  it('should reset attempts after successful login', () => {
    recordFailedAttempt();
    recordFailedAttempt();
    expect(getAttemptCount()).toBe(2);

    resetAttempts();
    expect(getAttemptCount()).toBe(0);
    expect(isLockedOut()).toBe(false);
  });

  it('should format remaining time correctly', () => {
    expect(formatRemainingTime(5000)).toBe('5s');
    expect(formatRemainingTime(60000)).toBe('1m');
    expect(formatRemainingTime(65000)).toBe('1m 5s');
    expect(formatRemainingTime(125000)).toBe('2m 5s');
  });

  it('should persist timeout state to localStorage', () => {
    recordFailedAttempt();
    recordFailedAttempt();
    
    const state = getTimeoutState();
    expect(state.attempts).toBe(2);
    
    // Check that it's actually in localStorage
    const stored = localStorage.getItem('ss_login_timeout');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.attempts).toBe(2);
  });

  it('should escalate timeout duration on subsequent failures after lockout', () => {
    // First lockout: 5 failed attempts = 1 minute timeout
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt();
    }
    
    const firstLockout = getTimeoutState();
    expect(firstLockout.lockoutCount).toBe(1);
    expect(isLockedOut()).toBe(true);
    const firstTimeout = getRemainingLockoutTime();
    expect(firstTimeout).toBeGreaterThan(0);
    expect(firstTimeout).toBeLessThanOrEqual(60000); // ~1 minute
    
    // Simulate lockout expiring
    const expiredState = {
      ...firstLockout,
      lockedUntil: Date.now() - 1000, // Expired 1 second ago
    };
    localStorage.setItem('ss_login_timeout', JSON.stringify(expiredState));
    
    // Second failure after lockout = 2 minute timeout
    const secondLockout = recordFailedAttempt();
    expect(secondLockout.lockoutCount).toBe(2);
    expect(isLockedOut()).toBe(true);
    const secondTimeout = getRemainingLockoutTime();
    expect(secondTimeout).toBeGreaterThan(firstTimeout);
    expect(secondTimeout).toBeLessThanOrEqual(120000); // ~2 minutes
  });

  it('should continue escalating timeouts (3rd lockout = 3 minutes)', () => {
    // Set up state after 2 lockouts
    const stateAfterTwoLockouts = {
      attempts: 1,
      lockedUntil: Date.now() - 1000, // Expired
      lockoutCount: 2,
    };
    localStorage.setItem('ss_login_timeout', JSON.stringify(stateAfterTwoLockouts));
    
    // Third failure after second lockout = 3 minute timeout
    const thirdLockout = recordFailedAttempt();
    expect(thirdLockout.lockoutCount).toBe(3);
    expect(isLockedOut()).toBe(true);
    const thirdTimeout = getRemainingLockoutTime();
    expect(thirdTimeout).toBeGreaterThan(120000); // Greater than 2 minutes
    expect(thirdTimeout).toBeLessThanOrEqual(180000); // ~3 minutes
  });

  it('should reset lockout count after successful login', () => {
    // Create multiple lockouts
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt();
    }
    expect(getTimeoutState().lockoutCount).toBe(1);
    
    // Reset (simulating successful login)
    resetAttempts();
    
    const state = getTimeoutState();
    expect(state.lockoutCount).toBe(0);
    expect(state.attempts).toBe(0);
  });
});
