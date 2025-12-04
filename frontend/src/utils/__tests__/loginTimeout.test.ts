import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkTimeout,
  recordFailedAttempt,
  resetAttempts,
  formatTimeRemaining,
  getAttemptCount,
  getLockoutCount,
  getTimeoutMinutes,
  STORAGE_KEY,
} from '../loginTimeout';

// Mock localStorage if not available
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof localStorage === 'undefined') {
  (globalThis as any).localStorage = localStorageMock as Storage;
}

describe('loginTimeout', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Ensure we're using real timers after each test
    vi.useRealTimers();
  });

  describe('formatTimeRemaining', () => {
    it('should format seconds as MM:SS', () => {
      expect(formatTimeRemaining(65)).toBe('1:05');
      expect(formatTimeRemaining(60)).toBe('1:00');
      expect(formatTimeRemaining(59)).toBe('0:59');
      expect(formatTimeRemaining(0)).toBe('0:00');
      expect(formatTimeRemaining(125)).toBe('2:05');
    });
  });

  describe('resetAttempts', () => {
    it('should clear the attempt data from localStorage', () => {
      localStorage.setItem('ss_login_attempts', JSON.stringify({
        count: 5,
        timeoutUntil: Date.now() + 60000,
        lastAttempt: Date.now(),
      }));

      resetAttempts();

      expect(localStorage.getItem('ss_login_attempts')).toBeNull();
    });
  });

  describe('checkTimeout', () => {
    it('should return not timed out when no timeout is set', () => {
      const result = checkTimeout();
      expect(result.isTimedOut).toBe(false);
      expect(result.remainingSeconds).toBe(0);
    });

    it('should return timed out when timeout is active', () => {
      const futureTime = Date.now() + 30000; // 30 seconds in the future
      localStorage.setItem('ss_login_attempts', JSON.stringify({
        count: 5,
        timeoutUntil: futureTime,
        lastAttempt: Date.now(),
      }));

      const result = checkTimeout();
      expect(result.isTimedOut).toBe(true);
      expect(result.remainingSeconds).toBeGreaterThan(0);
      expect(result.remainingSeconds).toBeLessThanOrEqual(30);
    });

    it('should return not timed out when timeout has expired', () => {
      const pastTime = Date.now() - 1000; // 1 second in the past
      localStorage.setItem('ss_login_attempts', JSON.stringify({
        count: 5,
        timeoutUntil: pastTime,
        lastAttempt: Date.now(),
      }));

      const result = checkTimeout();
      expect(result.isTimedOut).toBe(false);
      expect(result.remainingSeconds).toBe(0);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment attempt count on first failure', () => {
      const result = recordFailedAttempt();
      
      expect(result.attemptCount).toBe(1);
      expect(result.shouldShowWarning).toBe(false);
      expect(result.shouldTimeout).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should show warning on 4th attempt', () => {
      // Record 3 failed attempts
      recordFailedAttempt();
      recordFailedAttempt();
      recordFailedAttempt();

      // 4th attempt should show warning
      const result = recordFailedAttempt();
      
      expect(result.attemptCount).toBe(4);
      expect(result.shouldShowWarning).toBe(true);
      expect(result.shouldTimeout).toBe(false);
      expect(result.remainingAttempts).toBe(1);
    });

    it('should trigger timeout on 5th attempt', () => {
      // Record 4 failed attempts
      recordFailedAttempt();
      recordFailedAttempt();
      recordFailedAttempt();
      recordFailedAttempt();

      // 5th attempt should trigger timeout
      const result = recordFailedAttempt();
      
      expect(result.attemptCount).toBe(5);
      expect(result.shouldShowWarning).toBe(false);
      expect(result.shouldTimeout).toBe(true);
      expect(result.remainingAttempts).toBe(0);

      // Check that timeout is actually set
      const timeoutStatus = checkTimeout();
      expect(timeoutStatus.isTimedOut).toBe(true);
    });

    it('should extend timeout on subsequent failures during timeout', () => {
      // Trigger initial timeout
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }

      const firstTimeout = checkTimeout();
      const firstRemaining = firstTimeout.remainingSeconds;

      // Wait a bit
      vi.useFakeTimers();
      vi.advanceTimersByTime(5000); // Advance 5 seconds

      // Try again during timeout - should extend it
      const result = recordFailedAttempt();
      
      expect(result.shouldTimeout).toBe(true);
      expect(result.attemptCount).toBe(6);

      vi.useRealTimers();
    });

    it('should reset count after timeout expires', () => {
      // Set an expired timeout
      localStorage.setItem('ss_login_attempts', JSON.stringify({
        count: 5,
        timeoutUntil: Date.now() - 1000, // Expired
        lastAttempt: Date.now() - 61000,
      }));

      const result = recordFailedAttempt();
      
      // Should be treated as first attempt
      expect(result.attemptCount).toBe(1);
      expect(result.shouldTimeout).toBe(false);
    });
  });

  describe('getAttemptCount', () => {
    it('should return 0 when no attempts recorded', () => {
      expect(getAttemptCount()).toBe(0);
    });

    it('should return current attempt count', () => {
      recordFailedAttempt();
      recordFailedAttempt();
      
      expect(getAttemptCount()).toBe(2);
    });
  });

  describe('Progressive Timeout', () => {
    it('should apply 1-minute timeout on first lockout', () => {
      // Trigger first lockout (5 attempts)
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }

      expect(getLockoutCount()).toBe(1);
      expect(getTimeoutMinutes()).toBe(1);

      const timeout = checkTimeout();
      expect(timeout.isTimedOut).toBe(true);
      expect(timeout.remainingSeconds).toBeGreaterThan(0);
      expect(timeout.remainingSeconds).toBeLessThanOrEqual(60);
    });

    it('should apply 2-minute timeout on second lockout', () => {
      vi.useFakeTimers();
      
      // First lockout
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      // Wait for timeout to expire
      vi.advanceTimersByTime(61000);
      
      // Trigger second lockout
      recordFailedAttempt();
      
      expect(getLockoutCount()).toBe(2);
      expect(getTimeoutMinutes()).toBe(2);
      
      const timeout = checkTimeout();
      expect(timeout.isTimedOut).toBe(true);
      expect(timeout.remainingSeconds).toBeGreaterThan(60);
      expect(timeout.remainingSeconds).toBeLessThanOrEqual(120);
      
      vi.useRealTimers();
    });

    it('should apply 3-minute timeout on third lockout', () => {
      vi.useFakeTimers();
      
      // First lockout (5 attempts)
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      // Wait for timeout to expire
      vi.advanceTimersByTime(61000);
      
      // Second lockout (1 attempt after first timeout)
      recordFailedAttempt();
      
      // Wait for 2-minute timeout to expire
      vi.advanceTimersByTime(121000);
      
      // Third lockout (1 attempt after second timeout)
      recordFailedAttempt();
      
      expect(getLockoutCount()).toBe(3);
      expect(getTimeoutMinutes()).toBe(3);
      
      const timeout = checkTimeout();
      expect(timeout.isTimedOut).toBe(true);
      expect(timeout.remainingSeconds).toBeGreaterThan(120);
      expect(timeout.remainingSeconds).toBeLessThanOrEqual(180);
      
      vi.useRealTimers();
    });

    it('should increment lockout during active timeout', () => {
      // Trigger first lockout
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      expect(getLockoutCount()).toBe(1);
      
      // Try again during timeout
      recordFailedAttempt();
      
      expect(getLockoutCount()).toBe(2);
      expect(getTimeoutMinutes()).toBe(2);
    });

    it('should reset lockout count on successful login', () => {
      // Trigger multiple lockouts
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      expect(getLockoutCount()).toBe(1);
      
      // Successful login
      resetAttempts();
      
      expect(getLockoutCount()).toBe(0);
      expect(getAttemptCount()).toBe(0);
    });

    it('should preserve lockout count after timeout expires but before next attempt', () => {
      vi.useFakeTimers();
      
      // First lockout
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      expect(getLockoutCount()).toBe(1);
      
      // Wait for timeout to expire
      vi.advanceTimersByTime(61000);
      
      // Lockout count should still be 1 (preserved)
      expect(getLockoutCount()).toBe(1);
      
      // Timeout should be expired
      const timeout = checkTimeout();
      expect(timeout.isTimedOut).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('getLockoutCount', () => {
    it('should return 0 when no lockouts have occurred', () => {
      expect(getLockoutCount()).toBe(0);
    });

    it('should return lockout count after lockouts', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      expect(getLockoutCount()).toBe(1);
    });
  });

  describe('getTimeoutMinutes', () => {
    it('should return 1 for first lockout', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      
      expect(getTimeoutMinutes()).toBe(1);
    });

    it('should return progressive minutes for subsequent lockouts', () => {
      vi.useFakeTimers();
      
      // First lockout
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt();
      }
      expect(getTimeoutMinutes()).toBe(1);
      
      // Second lockout
      vi.advanceTimersByTime(61000);
      recordFailedAttempt();
      expect(getTimeoutMinutes()).toBe(2);
      
      // Third lockout
      vi.advanceTimersByTime(121000);
      recordFailedAttempt();
      expect(getTimeoutMinutes()).toBe(3);
      
      vi.useRealTimers();
    });
  });
});
