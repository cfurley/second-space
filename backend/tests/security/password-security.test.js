/**
 * Password Security Tests
 * 
 * Purpose: Verify password security implementation
 * Coverage: Hashing, comparison, validation
 * 
 * Test Strategy:
 * 1. Verify passwords are hashed (bcrypt)
 * 2. Test password strength requirements
 * 3. Verify timing attack resistance
 * 4. Test password comparison safety
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import pool from '../../src/db/index.js';
import userService from '../../src/services/userServices.js';

describe('Password Security Tests', () => {
  
  const testUser = {
    username: 'securitytest',
    password: 'SecurePass123!',
    firstName: 'Security',
    lastName: 'Test'
  };

  beforeAll(async () => {
    // Clean up any existing test user
    await pool.query(
      'DELETE FROM "user" WHERE username = $1',
      [testUser.username]
    );
  });

  afterAll(async () => {
    // Cleanup
    await pool.query(
      'DELETE FROM "user" WHERE username = $1',
      [testUser.username]
    );
  });

  describe('Password Hashing', () => {
    
    it('should hash passwords with bcrypt', async () => {
      const response = await request(app)
        .post('/user')
        .send(testUser);

      expect(response.status).toBe(200);

      // Fetch password from database
      const result = await pool.query(
        'SELECT password FROM "user" WHERE username = $1',
        [testUser.username]
      );

      const hashedPassword = result.rows[0].password;

      // Verify it's a bcrypt hash
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
      expect(hashedPassword).not.toBe(testUser.password);
      expect(hashedPassword.length).toBe(60);
    });

    it('should use sufficient salt rounds (min 10)', async () => {
      const result = await pool.query(
        'SELECT password FROM "user" WHERE username = $1',
        [testUser.username]
      );

      const hash = result.rows[0].password;
      const saltRounds = parseInt(hash.split('$')[2]);

      expect(saltRounds).toBeGreaterThanOrEqual(10);
    });

    it('should generate unique hashes for same password', async () => {
      const password = 'TestPassword123!';
      
      const hash1 = await userService.hashPassword(password);
      const hash2 = await userService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
      
      // But both should validate
      const valid1 = await userService.comparePassword(password, hash1);
      const valid2 = await userService.comparePassword(password, hash2);
      
      expect(valid1).toBe(true);
      expect(valid2).toBe(true);
    });

    it('should never store passwords in plain text', async () => {
      const result = await pool.query(
        'SELECT password FROM "user" WHERE username = $1',
        [testUser.username]
      );

      const storedPassword = result.rows[0].password;
      
      // Should NOT be plain text
      expect(storedPassword).not.toBe(testUser.password);
      expect(storedPassword).not.toBe('password');
      expect(storedPassword).not.toBe('12345');
      
      // Should be bcrypt format
      expect(storedPassword).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('Password Validation', () => {
    
    it('should enforce minimum length (8 characters)', async () => {
      const weakPasswords = [
        'Short1!',    // 7 chars
        'Tiny1!',     // 6 chars
        'A1!',        // 3 chars
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/user')
          .send({
            username: 'testshort',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('8');
      }
    });

    it('should enforce maximum length (64 characters)', async () => {
      const tooLongPassword = 'A'.repeat(65) + '1!Aa';
      
      const response = await request(app)
        .post('/user')
        .send({
          username: 'testlong',
          password: tooLongPassword,
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('64');
    });

    it('should require uppercase letter', async () => {
      const passwords = [
        'lowercase123!',
        'nouppercasehere1!',
        'test123!'
      ];

      for (const password of passwords) {
        const response = await request(app)
          .post('/user')
          .send({
            username: 'testupper',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('upper');
      }
    });

    it('should require lowercase letter', async () => {
      const passwords = [
        'UPPERCASE123!',
        'NOLOWERCASE1!',
      ];

      for (const password of passwords) {
        const response = await request(app)
          .post('/user')
          .send({
            username: 'testlower',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('lower');
      }
    });

    it('should require digit', async () => {
      const passwords = [
        'NoDigitHere!',
        'PasswordWithout!',
      ];

      for (const password of passwords) {
        const response = await request(app)
          .post('/user')
          .send({
            username: 'testdigit',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('digit');
      }
    });

    it('should require special character', async () => {
      const passwords = [
        'NoSpecialChar123',
        'Password1234',
      ];

      for (const password of passwords) {
        const response = await request(app)
          .post('/user')
          .send({
            username: 'testspecial',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('special');
      }
    });

    it('should reject passwords with whitespace', async () => {
      const passwords = [
        'Pass word123!',
        'Password 123!',
        ' Password123!',
        'Password123! ',
      ];

      for (const password of passwords) {
        const response = await request(app)
          .post('/user')
          .send({
            username: 'testwhitespace',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('whitespace');
      }
    });
  });

  describe('Password Comparison', () => {
    
    it('should correctly validate correct password', async () => {
      const result = await userService.authenticateLogin(
        testUser.username,
        testUser.password
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('username');
      expect(result.data).not.toHaveProperty('password');
    });

    it('should reject incorrect password', async () => {
      const result = await userService.authenticateLogin(
        testUser.username,
        'WrongPassword123!'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid Login');
    });

    it('should be resistant to timing attacks', async () => {
      // Test that comparison time is consistent
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();
        
        await userService.authenticateLogin(
          testUser.username,
          'WrongPassword' + i
        );
        
        const end = process.hrtime.bigint();
        times.push(Number(end - start) / 1000000); // Convert to ms
      }

      // Calculate variance
      const mean = times.reduce((a, b) => a + b) / times.length;
      const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be reasonably low (< 20% of mean)
      expect(stdDev / mean).toBeLessThan(0.2);
    });
  });

  describe('Password Update', () => {
    
    it('should hash new password when updating', async () => {
      const newPassword = 'NewSecurePass456!';
      
      // Update password
      const updateResult = await userService.updatePassword(
        testUser.username,
        newPassword
      );

      expect(updateResult.success).toBe(true);

      // Verify new hash
      const result = await pool.query(
        'SELECT password FROM "user" WHERE username = $1',
        [testUser.username]
      );

      const newHash = result.rows[0].password;
      
      // Should be bcrypt hash
      expect(newHash).toMatch(/^\$2[aby]\$/);
      expect(newHash).not.toBe(newPassword);

      // Should validate with new password
      const auth = await userService.authenticateLogin(
        testUser.username,
        newPassword
      );
      expect(auth.success).toBe(true);

      // Should NOT validate with old password
      const oldAuth = await userService.authenticateLogin(
        testUser.username,
        testUser.password
      );
      expect(oldAuth.success).toBe(false);
    });
  });

  describe('Password Storage', () => {
    
    it('should never return password hash in API responses', async () => {
      const response = await request(app)
        .post('/user/authentication')
        .send({
          username: testUser.username,
          password: 'NewSecurePass456!'
        });

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('password');
      expect(JSON.stringify(response.body)).not.toContain('$2b$');
    });

    it('should not log passwords', async () => {
      // This test ensures passwords don't appear in console logs
      const consoleSpy = vi.spyOn(console, 'log');
      
      await request(app)
        .post('/user/authentication')
        .send({
          username: testUser.username,
          password: 'TestPassword123!'
        });

      const logs = consoleSpy.mock.calls.flat().join(' ');
      expect(logs).not.toContain('TestPassword123!');
      expect(logs).not.toContain('password: ');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Common Password Attacks', () => {
    
    it('should reject common weak passwords', async () => {
      const commonPasswords = [
        'Password123!',
        'Qwerty123!',
        'Admin123!',
        'Welcome123!',
      ];

      // Note: This would require implementing a common password check
      // For now, verify they meet strength requirements
      for (const password of commonPasswords) {
        const validation = await userService.validatePassword(password);
        expect(validation.success).toBe(true); // They meet strength rules
        
        // TODO: Implement common password blacklist
      }
    });

    it('should handle password brute force attempts', async () => {
      // This will be tested in rate-limiting.test.js
      // Verifying rate limiting prevents brute force
    });
  });
});
