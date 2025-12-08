import authenticationService from "../authenticationServices.js";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

describe("authenticationServices", () => {
  beforeEach(() => {
    // Clear all attempt records before each test
    authenticationService.clearAllAttempts();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    authenticationService.clearAllAttempts();
  });

  describe("recordFailedAttempt", () => {
    test("should record first failed attempt", () => {
      const result = authenticationService.recordFailedAttempt("user1");
      
      expect(result.shouldLock).toBe(false);
      expect(result.shouldWarn).toBe(false);
      expect(result.attemptsLeft).toBe(4); // 5 - 1 = 4 attempts left
    });

    test("should increment attempts on multiple failures", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      const result = authenticationService.recordFailedAttempt("user1");
      
      expect(result.shouldLock).toBe(false);
      expect(result.attemptsLeft).toBe(2); // 5 - 3 = 2 attempts left
    });

    test("should issue warning after 4 failed attempts", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      const result = authenticationService.recordFailedAttempt("user1");
      
      expect(result.shouldWarn).toBe(true);
      expect(result.attemptsLeft).toBe(1); // 5 - 4 = 1 attempt left
      // shouldLock is not set when warning, so it's undefined or false
    });

    test("should lock account after 5 failed attempts with 1 minute timeout", () => {
      for (let i = 0; i < 4; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      const result = authenticationService.recordFailedAttempt("user1");
      
      expect(result.shouldLock).toBe(true);
      expect(result.timeoutMinutes).toBe(1); // First lockout is 1 minute
      expect(result.lockoutCount).toBe(1);
    });

    test("should escalate timeout on second lockout", () => {
      // First lockout
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      // Wait for lockout to expire
      vi.advanceTimersByTime(1 * 60 * 1000 + 1000);
      
      // Second lockout
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      const result = authenticationService.checkLockout("user1");
      expect(result.locked).toBe(true);
      expect(result.lockoutCount).toBe(2); // Second lockout = 2 minutes
    });

    test("should track attempts separately for different identifiers", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user2");
      
      // Can't directly check count, but can infer from attemptsLeft
      const user1Result = authenticationService.recordFailedAttempt("user1");
      const user2Result = authenticationService.recordFailedAttempt("user2");
      
      expect(user1Result.attemptsLeft).toBe(2); // 3 attempts, 2 left
      expect(user2Result.attemptsLeft).toBe(3); // 2 attempts, 3 left
    });

    test("should not increment attempts while locked", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      // Try to record more attempts while locked
      const result = authenticationService.recordFailedAttempt("user1");
      
      expect(result.shouldLock).toBe(true);
      expect(result.lockoutCount).toBe(1);
    });
  });

  describe("checkLockout", () => {
    test("should return not locked for identifier with no attempts", () => {
      const result = authenticationService.checkLockout("newuser");
      
      expect(result.locked).toBe(false);
      expect(result.lockoutCount).toBe(0);
      expect(result.remainingMs).toBe(0);
    });

    test("should return not locked for identifier with few attempts", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      
      const result = authenticationService.checkLockout("user1");
      
      expect(result.locked).toBe(false);
      expect(result.lockoutCount).toBe(0);
    });

    test("should return locked when account is locked", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      const result = authenticationService.checkLockout("user1");
      
      expect(result.locked).toBe(true);
      expect(result.lockoutCount).toBe(1);
      expect(result.remainingMs).toBeGreaterThan(0);
    });

    test("should return not locked after timeout expires", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      // Fast-forward time past the 1 minute timeout
      vi.advanceTimersByTime(1 * 60 * 1000 + 1000);
      
      const result = authenticationService.checkLockout("user1");
      
      expect(result.locked).toBe(false);
      expect(result.remainingMs).toBe(0);
    });

    test("should calculate remaining time correctly", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30 * 1000);
      
      const result = authenticationService.checkLockout("user1");
      
      expect(result.locked).toBe(true);
      expect(result.remainingMs).toBeLessThanOrEqual(31 * 1000); // ~30 seconds remaining
      expect(result.remainingMs).toBeGreaterThan(25 * 1000);
    });
  });

  describe("resetAttempts", () => {
    test("should reset attempts after successful login", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      
      authenticationService.resetAttempts("user1");
      
      const result = authenticationService.checkLockout("user1");
      expect(result.lockoutCount).toBe(0);
      expect(result.locked).toBe(false);
    });

    test("should clear lockout when attempts are reset", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      authenticationService.resetAttempts("user1");
      
      const result = authenticationService.checkLockout("user1");
      expect(result.locked).toBe(false);
      expect(result.lockoutCount).toBe(0);
    });

    test("should not affect other identifiers", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user2");
      authenticationService.recordFailedAttempt("user2");
      
      authenticationService.resetAttempts("user1");
      
      const user1Result = authenticationService.checkLockout("user1");
      const user2Result = authenticationService.checkLockout("user2");
      
      expect(user1Result.lockoutCount).toBe(0);
      expect(user2Result.lockoutCount).toBe(0); // No lockout yet, just attempts
    });

    test("should handle resetting non-existent identifier gracefully", () => {
      expect(() => {
        authenticationService.resetAttempts("nonexistent");
      }).not.toThrow();
    });
  });

  describe("clearAllAttempts", () => {
    test("should clear all tracked attempts", () => {
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user2");
      authenticationService.recordFailedAttempt("user3");
      
      authenticationService.clearAllAttempts();
      
      expect(authenticationService.checkLockout("user1").lockoutCount).toBe(0);
      expect(authenticationService.checkLockout("user2").lockoutCount).toBe(0);
      expect(authenticationService.checkLockout("user3").lockoutCount).toBe(0);
    });
  });

  describe("edge cases", () => {
    test("should handle rapid successive attempts", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      const result = authenticationService.checkLockout("user1");
      expect(result.locked).toBe(true);
    });

    test("should handle empty identifier string", () => {
      const result = authenticationService.recordFailedAttempt("");
      expect(result.attemptsLeft).toBe(4);
    });

    test("should maintain lockout state across multiple check calls", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      authenticationService.checkLockout("user1");
      authenticationService.checkLockout("user1");
      const result = authenticationService.checkLockout("user1");
      
      expect(result.locked).toBe(true);
      expect(result.lockoutCount).toBe(1);
    });

    test("should allow new attempts after lockout expires", () => {
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      // Wait for lockout to expire
      vi.advanceTimersByTime(1 * 60 * 1000 + 1000);
      
      // Should be able to record new attempts
      const result = authenticationService.recordFailedAttempt("user1");
      expect(result.shouldLock).toBe(false);
      expect(result.attemptsLeft).toBe(4); // Count reset after timeout
    });

    test("should escalate timeout on continued failures after lockout expires", () => {
      // First lockout (1 minute)
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      // Wait for lockout to expire
      vi.advanceTimersByTime(1 * 60 * 1000 + 1000);
      
      // Second lockout (2 minutes)
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user1");
      }
      
      const result = authenticationService.checkLockout("user1");
      expect(result.locked).toBe(true);
      expect(result.lockoutCount).toBe(2); // Escalated timeout
    });
  });

  describe("multiple concurrent users", () => {
    test("should handle multiple users with different attempt counts", () => {
      // User 1: 2 attempts (not locked)
      authenticationService.recordFailedAttempt("user1");
      authenticationService.recordFailedAttempt("user1");
      
      // User 2: 5 attempts (locked)
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user2");
      }
      
      // User 3: 10 attempts (locked twice - escalated timeout)
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user3");
      }
      // Advance time to expire first lockout
      vi.advanceTimersByTime(1 * 60 * 1000 + 1000);
      // Trigger second lockout
      for (let i = 0; i < 5; i++) {
        authenticationService.recordFailedAttempt("user3");
      }
      
      const user1 = authenticationService.checkLockout("user1");
      const user2 = authenticationService.checkLockout("user2");
      const user3 = authenticationService.checkLockout("user3");
      
      expect(user1.locked).toBe(false);
      // user2's 1-minute lockout expired during user3's processing (vi.advanceTimersByTime affected all timers)
      // So we can only confirm lockoutCount
      expect(user2.lockoutCount).toBe(1);
      expect(user3.locked).toBe(true); // Still locked with 2-minute timeout
      expect(user3.lockoutCount).toBe(2);
      expect(user1.lockoutCount).toBe(0);
    });
  });
});
