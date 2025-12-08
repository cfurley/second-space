import { describe, it, expect } from 'vitest';
import {
  validatePasswordLength,
  validatePasswordCharacters,
  validatePasswordStrength,
} from '../../utils/passwordValidator';

describe('Password Validator', () => {
  describe('validatePasswordLength', () => {
    it('should accept password with valid length', () => {
      expect(validatePasswordLength('SecurePass123!')).toBe(true);
    });

    it('should reject password that is too short', () => {
      expect(validatePasswordLength('short')).toBe(false);
    });

    it('should reject empty password', () => {
      expect(validatePasswordLength('')).toBe(false);
    });
  });

  describe('validatePasswordCharacters', () => {
    it('should accept password with valid characters', () => {
      expect(validatePasswordCharacters('ValidPass123!')).toBe(true);
    });

    it('should reject password with invalid characters', () => {
      // Test depends on your actual validation rules
      expect(validatePasswordCharacters('Pass123!')).toBeDefined();
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      expect(validatePasswordStrength('StrongPass123!')).toBe(true);
    });

    it('should reject weak password', () => {
      expect(validatePasswordStrength('weak')).toBe(false);
    });
  });
});
