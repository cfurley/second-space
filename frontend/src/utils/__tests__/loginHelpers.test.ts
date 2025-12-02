import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLoginFailureStrategy,
  getResetLockoutState,
  getLockoutMessage,
  handleRememberUsername,
} from '../loginHelpers';

describe('Login Helper Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getLoginFailureStrategy', () => {
    it('should return lockout strategy for 5+ attempts', () => {
      const result = getLoginFailureStrategy(5);
      
      expect(result.shouldLock).toBe(true);
      expect(result.shouldWarn).toBe(false);
      expect(result.message).toContain('locked out');
      expect(result.newState.isLocked).toBe(true);
      expect(result.newState.attemptCount).toBe(5);
    });

    it('should return warning strategy for 4 attempts', () => {
      const result = getLoginFailureStrategy(4);
      
      expect(result.shouldLock).toBe(false);
      expect(result.shouldWarn).toBe(true);
      expect(result.message).toContain('Warning');
      expect(result.newState.showWarning).toBe(true);
      expect(result.newState.attemptCount).toBe(4);
    });

    it('should return generic error strategy for < 4 attempts', () => {
      const result = getLoginFailureStrategy(3);
      
      expect(result.shouldLock).toBe(false);
      expect(result.shouldWarn).toBe(false);
      expect(result.message).toContain('Login failed');
      expect(result.newState.isLocked).toBe(false);
      expect(result.newState.showWarning).toBe(false);
      expect(result.newState.attemptCount).toBe(3);
    });

    it('should handle edge cases correctly', () => {
      const result1 = getLoginFailureStrategy(1);
      expect(result1.shouldLock).toBe(false);
      expect(result1.shouldWarn).toBe(false);

      const result10 = getLoginFailureStrategy(10);
      expect(result10.shouldLock).toBe(true);
      expect(result10.newState.attemptCount).toBe(10);
    });
  });

  describe('getResetLockoutState', () => {
    it('should return clean lockout state', () => {
      const state = getResetLockoutState();
      
      expect(state.isLocked).toBe(false);
      expect(state.remainingTime).toBe(0);
      expect(state.showWarning).toBe(false);
      expect(state.attemptCount).toBe(0);
    });

    it('should clear localStorage', () => {
      localStorage.setItem('ss_login_timeout', JSON.stringify({ attempts: 5, lockedUntil: Date.now() + 60000 }));
      
      getResetLockoutState();
      
      const stored = localStorage.getItem('ss_login_timeout');
      expect(stored).toBeNull();
    });
  });

  describe('getLockoutMessage', () => {
    it('should format message with seconds', () => {
      const message = getLockoutMessage(5000);
      expect(message).toContain('5s');
    });

    it('should format message with minutes', () => {
      const message = getLockoutMessage(60000);
      expect(message).toContain('1m');
    });

    it('should format message with minutes and seconds', () => {
      const message = getLockoutMessage(65000);
      expect(message).toContain('1m 5s');
    });
  });

  describe('handleRememberUsername', () => {
    it('should save username when remember is true', () => {
      handleRememberUsername(true, 'testuser');
      
      const saved = localStorage.getItem('ss_remembered_username');
      expect(saved).toBe('testuser');
    });

    it('should trim and save username', () => {
      handleRememberUsername(true, '  testuser  ');
      
      const saved = localStorage.getItem('ss_remembered_username');
      expect(saved).toBe('testuser');
    });

    it('should remove username when remember is false', () => {
      localStorage.setItem('ss_remembered_username', 'testuser');
      
      handleRememberUsername(false, 'testuser');
      
      const saved = localStorage.getItem('ss_remembered_username');
      expect(saved).toBeNull();
    });

    it('should not save empty username', () => {
      handleRememberUsername(true, '');
      
      const saved = localStorage.getItem('ss_remembered_username');
      expect(saved).toBeNull();
    });

    it('should not save whitespace-only username', () => {
      handleRememberUsername(true, '   ');
      
      const saved = localStorage.getItem('ss_remembered_username');
      expect(saved).toBeNull();
    });
  });
});
