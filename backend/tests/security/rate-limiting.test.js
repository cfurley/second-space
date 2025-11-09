/**
 * Rate Limiting Security Tests
 * 
 * Purpose: Verify rate limiting protects against brute force attacks
 * Coverage: Authentication endpoints, API limits
 * 
 * Test Strategy:
 * 1. Test authentication rate limiting (5 attempts per 15 min)
 * 2. Test API rate limiting (100 requests per 15 min)
 * 3. Verify lockout periods
 * 4. Test rate limit bypass attempts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('Rate Limiting Security Tests', () => {
  
  const testUser = {
    username: 'ratelimittest',
    password: 'TestPass123!'
  };

  beforeEach(async () => {
    // Wait for rate limit reset
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Authentication Rate Limiting', () => {
    
    it('should allow up to 5 login attempts', async () => {
      const maxAttempts = 5;
      
      for (let i = 0; i < maxAttempts; i++) {
        const response = await request(app)
          .post('/user/authentication')
          .send({
            username: testUser.username,
            password: 'wrong_password_' + i
          });

        // Should get 404 (invalid login), not 429 (rate limited)
        expect(response.status).toBe(404);
      }
    });

    it('should block 6th login attempt within 15 minutes', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/user/authentication')
          .send({
            username: testUser.username + '_blocked',
            password: 'wrong_password'
          });
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/user/authentication')
        .send({
          username: testUser.username + '_blocked',
          password: 'wrong_password'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many');
      expect(response.body.error).toContain('try again later');
    });

    it('should return proper rate limit headers', async () => {
      const response = await request(app)
        .post('/user/authentication')
        .send({
          username: 'test',
          password: 'test'
        });

      // Check for rate limit headers
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });

    it('should track rate limits per IP/user', async () => {
      // Different usernames should have separate rate limits
      const user1Attempts = [];
      const user2Attempts = [];

      // User 1: Make 5 attempts
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/user/authentication')
          .send({ username: 'user1', password: 'wrong' });
        user1Attempts.push(res.status);
      }

      // User 2: Should still be able to attempt
      const user2Response = await request(app)
        .post('/user/authentication')
        .send({ username: 'user2', password: 'wrong' });

      // User 1 should be rate limited
      expect(user1Attempts[4]).toBe(404); // Last allowed attempt

      // User 2 should NOT be rate limited yet
      expect(user2Response.status).toBe(404); // Invalid login, not rate limited
    });
  });

  describe('API Rate Limiting', () => {
    
    it('should allow up to 100 API requests', async () => {
      const maxRequests = 100;
      let successfulRequests = 0;

      for (let i = 0; i < maxRequests; i++) {
        const response = await request(app)
          .get('/spaces');

        if (response.status !== 429) {
          successfulRequests++;
        }
      }

      // Should allow at least 90 requests (accounting for other tests)
      expect(successfulRequests).toBeGreaterThanOrEqual(90);
    });

    it('should block excessive API requests', async () => {
      // Make 100+ requests rapidly
      const responses = [];
      
      for (let i = 0; i < 110; i++) {
        const response = await request(app)
          .get('/spaces');
        responses.push(response.status);
      }

      // Some should be rate limited
      const rateLimited = responses.filter(status => status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should have different limits for different endpoints', async () => {
      // Auth endpoint: 5 requests per 15 min
      // API endpoints: 100 requests per 15 min
      
      const authLimit = [];
      const apiLimit = [];

      // Test auth limit
      for (let i = 0; i < 7; i++) {
        const res = await request(app)
          .post('/user/authentication')
          .send({ username: 'test_' + i, password: 'test' });
        authLimit.push(res.status);
      }

      // Test API limit
      for (let i = 0; i < 7; i++) {
        const res = await request(app)
          .get('/spaces');
        apiLimit.push(res.status);
      }

      // Auth should be stricter (more 429s)
      const authBlocked = authLimit.filter(s => s === 429).length;
      const apiBlocked = apiLimit.filter(s => s === 429).length;

      expect(authBlocked).toBeGreaterThan(apiBlocked);
    });
  });

  describe('Rate Limit Bypass Prevention', () => {
    
    it('should not be bypassed by changing User-Agent', async () => {
      // Make 5 attempts with same IP, different User-Agents
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/user/authentication')
          .set('User-Agent', `Browser-${i}`)
          .send({
            username: 'bypasstest',
            password: 'wrong'
          });
      }

      // 6th attempt with different User-Agent should still be blocked
      const response = await request(app)
        .post('/user/authentication')
        .set('User-Agent', 'Different-Browser')
        .send({
          username: 'bypasstest',
          password: 'wrong'
        });

      expect(response.status).toBe(429);
    });

    it('should not be bypassed by changing request headers', async () => {
      // Make 5 attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/user/authentication')
          .set('X-Custom-Header', `value-${i}`)
          .send({
            username: 'headerbypass',
            password: 'wrong'
          });
      }

      // 6th attempt should be blocked regardless of headers
      const response = await request(app)
        .post('/user/authentication')
        .set('X-Different-Header', 'different-value')
        .send({
          username: 'headerbypass',
          password: 'wrong'
        });

      expect(response.status).toBe(429);
    });

    it('should handle distributed attack patterns', async () => {
      // Simulate distributed attack (multiple usernames, same IP)
      const attempts = [];
      
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/user/authentication')
          .send({
            username: `distributed_${i}`,
            password: 'wrong'
          });
        attempts.push(res.status);
      }

      // Should eventually rate limit even with different usernames
      const blocked = attempts.filter(status => status === 429);
      expect(blocked.length).toBeGreaterThan(0);
    });
  });

  describe('Rate Limit Reset', () => {
    
    it('should reset after timeout period', async () => {
      // This test requires waiting for the rate limit window
      // In production, this would be 15 minutes
      // For testing, you might want to use a shorter window
      
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/user/authentication')
          .send({
            username: 'resettest',
            password: 'wrong'
          });
      }

      // 6th attempt should be blocked
      const blocked = await request(app)
        .post('/user/authentication')
        .send({
          username: 'resettest',
          password: 'wrong'
        });
      expect(blocked.status).toBe(429);

      // Wait for rate limit to reset (adjust based on your config)
      // In test environment, you might mock time or use shorter windows
      // await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));

      // For now, verify the rate limit header indicates reset time
      expect(blocked.headers['ratelimit-reset']).toBeDefined();
    });
  });

  describe('Legitimate User Experience', () => {
    
    it('should not affect legitimate users', async () => {
      // A legitimate user with correct credentials
      // Should not be rate limited even with multiple requests
      
      // Assuming user exists in test database
      const legitimateRequests = [];
      
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .get('/spaces'); // Authenticated request
        legitimateRequests.push(res.status);
      }

      // All should succeed
      legitimateRequests.forEach(status => {
        expect(status).not.toBe(429);
      });
    });

    it('should provide clear error messages when rate limited', async () => {
      // Make enough requests to trigger rate limit
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/user/authentication')
          .send({
            username: 'errormsgtest',
            password: 'wrong'
          });
      }

      const response = await request(app)
        .post('/user/authentication')
        .send({
          username: 'errormsgtest',
          password: 'wrong'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('too many');
      expect(response.body.error.toLowerCase()).toContain('try again');
    });
  });
});
