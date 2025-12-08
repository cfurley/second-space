import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../../utils/api';

// Mock fetch for testing
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('User endpoints', () => {
    it('should call login endpoint with correct data', async () => {
      const mockResponse = { id: '1', username: 'testuser' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await api.login('testuser', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/authentication'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(api.login('wrong', 'wrong')).rejects.toThrow();
    });
  });

  describe('Space endpoints', () => {
    it('should fetch spaces successfully', async () => {
      const mockSpaces = [
        { id: '1', name: 'My Space', userId: 'user1' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockSpaces,
      });

      const result = await api.getSpaces();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/spaces'),
        expect.any(Object)
      );
      expect(result).toEqual(mockSpaces);
    });
  });

  describe('Health check', () => {
    it('should check backend health', async () => {
      const mockHealth = { status: 'running', message: 'Second Space API' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockHealth,
      });

      const result = await api.healthCheck();

      expect(result).toEqual(mockHealth);
    });
  });
});
