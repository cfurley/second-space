// Simple username and password validators.
// These are intentionally synchronous and return arrays of error messages.
// They mirror the rules used by the project's tests and can be reused
// on both client and server (move to backend when adding server-side validation).

export function validateUsername(username: string): string[] {
  const errors: string[] = [];
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
    return errors;
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) errors.push('Username must be at least 3 characters');
  if (trimmed.length > 30) errors.push('Username must be at most 30 characters');
  // allow letters, numbers, underscores, hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) errors.push('Username may only contain letters, numbers, underscore and hyphen');
  return errors;
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password || password.length === 0) {
    errors.push('Password is required');
    return errors;
  }
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be at most 128 characters');
  // common rules: must contain letter and number
  if (!/[a-zA-Z]/.test(password)) errors.push('Password must contain at least one letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  return errors;
}
