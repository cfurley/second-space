/**
 * Login Handler Helper Functions
 * 
 * Extracted from login.tsx to reduce complexity and improve testability.
 * Follows Single Responsibility Principle.
 */

import {
  getRemainingLockoutTime,
  resetAttempts,
  formatRemainingTime,
  getLockoutCount,
} from "./loginTimeout";

export interface LockoutState {
  isLocked: boolean;
  remainingTime: number;
  showWarning: boolean;
  attemptCount: number;
}

export interface LoginSuccessData {
  username: string;
  display_name?: string;
  [key: string]: any;
}

export interface LoginFailureResponse {
  shouldLock: boolean;
  shouldWarn: boolean;
  message: string;
  newState: LockoutState;
}

/**
 * Handle successful login - persists remembered username and resets lockout state
 */
export function handleRememberUsername(
  remember: boolean,
  username: string
): void {
  try {
    if (remember && username && username.trim().length > 0) {
      localStorage.setItem("ss_remembered_username", username.trim());
    } else {
      localStorage.removeItem("ss_remembered_username");
    }
  } catch (e) {
    console.error('Error managing remembered username:', e);
  }
}

/**
 * Reset all lockout-related state after successful login
 */
export function getResetLockoutState(): LockoutState {
  resetAttempts();
  return {
    isLocked: false,
    remainingTime: 0,
    showWarning: false,
    attemptCount: 0,
  };
}

/**
 * Strategy pattern for handling different login failure scenarios
 * Supports escalating timeouts
 */
export function getLoginFailureStrategy(attempts: number): LoginFailureResponse {
  const baseState: LockoutState = {
    isLocked: false,
    remainingTime: 0,
    showWarning: false,
    attemptCount: attempts,
  };

  // Strategy for 5+ attempts: Lock out the user with escalating timeout
  if (attempts >= 5) {
    const lockoutCount = getLockoutCount();
    const remainingTime = getRemainingLockoutTime();
    const minutes = Math.ceil(remainingTime / 60000);
    
    let message = `Too many failed attempts. You are locked out for ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    
    if (lockoutCount > 1) {
      message += ` (Lockout #${lockoutCount})`;
    }
    
    return {
      shouldLock: true,
      shouldWarn: false,
      message,
      newState: {
        ...baseState,
        isLocked: true,
        remainingTime,
      },
    };
  }

  // Strategy for 4 attempts: Show warning
  if (attempts === 4) {
    return {
      shouldLock: false,
      shouldWarn: true,
      message: "Warning: One more failed attempt will result in a timeout.",
      newState: {
        ...baseState,
        showWarning: true,
      },
    };
  }

  // Strategy for < 4 attempts: Generic error
  return {
    shouldLock: false,
    shouldWarn: false,
    message: "Login failed. Please check your credentials and try again.",
    newState: baseState,
  };
}

/**
 * Format a lockout message with remaining time
 */
export function getLockoutMessage(remainingTime: number): string {
  return `Too many failed attempts. Please wait ${formatRemainingTime(remainingTime)} before trying again.`;
}
