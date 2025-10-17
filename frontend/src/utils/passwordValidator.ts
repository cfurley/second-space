// Adapted from attachment password_validator.js

/**
 * Return true if password has valid characters (letters, digits, symbols), else false.
 * Allows most printable characters except spaces.
 */
export function validatePasswordCharacters(password: string): boolean {
  // Allow letters, digits, and common symbols (no spaces)
  const pattern = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;
  return pattern.test(password);
}

/**
 * Return true if password length is between 8 and 64 characters, else false.
 */
export function validatePasswordLength(password: string): boolean {
  return password.length >= 8 && password.length <= 64;
}

/**
 * Return true if password contains uppercase, lowercase, digit, and special char.
 * Else return false.
 */
export function validatePasswordStrength(password: string): boolean {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
}
