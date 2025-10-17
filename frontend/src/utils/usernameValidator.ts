// Adapted from attachment username_validator.js

/**
 * Return true if valid (only letters, digits, underscores, hyphens), else false.
 */
export function validateUsernameCharacters(username: string): boolean {
  const pattern = /^[A-Za-z0-9_-]+$/;
  return pattern.test(username);
}

/**
 * Return true if length < 16, else false.
 */
export function validateUsernameLength(username: string): boolean {
  return username.length < 16;
}

/**
 * Return true if no profanity found, else false.
 */
export function validateUsernameDoesNotContainProfanity(username: string): boolean {
  const blacklist = ["badword1", "badword2", "offensiveword"]; // example list
  const lowered = username.toLowerCase();
  for (const word of blacklist) {
    if (lowered.includes(word)) {
      return false;
    }
  }
  return true;
}
