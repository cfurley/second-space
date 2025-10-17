// @ts-nocheck
import { validateUsername, validatePassword } from './validators';

describe('validateUsername', () => {
  test('rejects empty username', () => {
    expect(validateUsername('')).toContain('Username is required');
  });
  test('rejects short username', () => {
    expect(validateUsername('ab')).toContain('Username must be at least 3 characters');
  });
  test('rejects bad chars', () => {
    expect(validateUsername('bad name')).toContain('Username may only contain letters, numbers, underscore and hyphen');
  });
});

describe('validatePassword', () => {
  test('rejects empty password', () => {
    expect(validatePassword('')).toContain('Password is required');
  });
  test('requires length and characters', () => {
    const res = validatePassword('short');
    expect(res).toContain('Password must be at least 8 characters');
  });
});
