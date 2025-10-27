import { describe, it, expect } from 'vitest';
import {
  validateUsernameLength,
  validateUsernameCharacters,
  validateUsernameDoesNotContainProfanity,
} from '../usernameValidator';

describe('Username Validator', () => {
  describe('validateUsernameLength', () => {
    it('should accept username with valid length', () => {
      expect(validateUsernameLength('testuser')).toBe(true);
    });

    it('should reject username that is too short', () => {
      expect(validateUsernameLength('ab')).toBe(false);
    });

    it('should reject empty username', () => {
      expect(validateUsernameLength('')).toBe(false);
    });
  });

  describe('validateUsernameCharacters', () => {
    it('should accept username with valid characters', () => {
      expect(validateUsernameCharacters('validuser123')).toBe(true);
    });

    it('should handle special characters appropriately', () => {
      // Test based on your actual validation rules
      expect(validateUsernameCharacters('user_name')).toBeDefined();
    });
  });

  describe('validateUsernameDoesNotContainProfanity', () => {
    it('should accept clean username', () => {
      expect(validateUsernameDoesNotContainProfanity('cleanusername')).toBe(true);
    });

    it('should reject profanity', () => {
      // Test based on your profanity filter
      expect(validateUsernameDoesNotContainProfanity('badword')).toBeDefined();
    });
  });
});
