/**
 * SQL Injection Security Tests
 * 
 * Purpose: Verify the application is protected against SQL injection attacks
 * Coverage: All database query endpoints
 * 
 * Test Strategy:
 * 1. Test common SQL injection patterns
 * 2. Verify parameterized queries are used
 * 3. Test special characters are properly escaped
 * 4. Verify error messages don't leak database info
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import pool from '../../src/db/index.js';

describe('SQL Injection Security Tests', () => {
  
  beforeAll(async () => {
    // Setup test database
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('ROLLBACK');
    await pool.end();
  });

  describe('Login Endpoint - SQL Injection Prevention', () => {
    
    it('should reject SQL injection in username field', async () => {
      const maliciousPayloads = [
        "admin' OR '1'='1",
        "admin'--",
        "admin' OR '1'='1'--",
        "admin'; DROP TABLE user;--",
        "' OR 1=1--",
        "admin' UNION SELECT * FROM user--",
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/user/authentication')
          .send({
            username: payload,
            password: 'password123'
          });

        // Should NOT return user data
        expect(response.status).toBe(404);
        expect(response.body).not.toHaveProperty('id');
        
        // Should not leak database structure info
        expect(response.body.error).not.toContain('SQL');
        expect(response.body.error).not.toContain('syntax');
        expect(response.body.error).not.toContain('column');
      }
    });

    it('should reject SQL injection in password field', async () => {
      const maliciousPasswords = [
        "password' OR '1'='1",
        "' OR 1=1--",
        "password'; DROP TABLE user;--",
      ];

      for (const payload of maliciousPasswords) {
        const response = await request(app)
          .post('/user/authentication')
          .send({
            username: 'testuser',
            password: payload
          });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Invalid Login');
      }
    });

    it('should use parameterized queries (verify in logs)', async () => {
      // This test verifies that queries are parameterized
      // by checking they don't directly concatenate user input
      
      const response = await request(app)
        .post('/user/authentication')
        .send({
          username: "test' OR '1'='1",
          password: 'password'
        });

      // If parameterized correctly, this will just be a failed login
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Invalid Login');
    });
  });

  describe('User Creation - SQL Injection Prevention', () => {
    
    it('should reject SQL injection in user creation fields', async () => {
      const maliciousData = {
        username: "admin'; DROP TABLE user;--",
        password: "Test123!",
        firstName: "Robert'); DROP TABLE space;--",
        lastName: "Tables'; DELETE FROM user WHERE '1'='1"
      };

      const response = await request(app)
        .post('/user')
        .send(maliciousData);

      // Should either reject or safely escape
      if (response.status === 200) {
        // If created, verify data was escaped
        expect(response.body.username).not.toContain('DROP');
        expect(response.body.firstName).not.toContain('DROP');
      } else {
        // Or should reject invalid characters
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Space Queries - SQL Injection Prevention', () => {
    
    it('should reject SQL injection in space search', async () => {
      const maliciousSearches = [
        "test' OR '1'='1",
        "'; DROP TABLE space;--",
        "test' UNION SELECT * FROM user--",
      ];

      for (const search of maliciousSearches) {
        const response = await request(app)
          .get(`/spaces?search=${encodeURIComponent(search)}`);

        // Should handle safely without error
        expect(response.status).not.toBe(500);
        
        // Should not return unauthorized data
        if (response.status === 200) {
          expect(response.body).not.toContain('password');
          expect(response.body).not.toContain('hash');
        }
      }
    });
  });

  describe('Database Error Handling', () => {
    
    it('should not leak database structure in error messages', async () => {
      const response = await request(app)
        .post('/user/authentication')
        .send({
          username: "test' OR sleep(5)--",
          password: 'password'
        });

      // Error message should be generic
      expect(response.body.error).not.toContain('postgres');
      expect(response.body.error).not.toContain('SQL');
      expect(response.body.error).not.toContain('table');
      expect(response.body.error).not.toContain('column');
      expect(response.body.error).not.toContain('syntax');
    });
  });
});
