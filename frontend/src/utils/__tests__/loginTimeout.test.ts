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
});
