import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  setUserCache,
  getUserCache,
  clearUserCache,
  hasValidUserCache,
  updateUserCache,
  getUserField,
  getUserDisplayName,
  getUserInitials,
  type UserData,
} from '../userCache';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('UserCache Utility', () => {
  const mockUser: UserData = {
    id: '123',
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    display_name: 'Johnny',
    profile_picture_id: 'pic123',
    theme_id: 'theme1',
    timezone: 'America/New_York',
    last_login_date_utc: '2025-12-07T12:00:00Z',
    create_date_utc: '2025-01-01T00:00:00Z',
    update_date_utc: '2025-12-07T12:00:00Z',
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('setUserCache', () => {
    it('should store user data in localStorage', () => {
      setUserCache(mockUser);
      
      const stored = localStorageMock.getItem('ss_user_data');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(mockUser);
    });

    it('should set expiry time with default TTL', () => {
      const beforeTime = Date.now();
      setUserCache(mockUser);
      const afterTime = Date.now();
      
      const expiryStr = localStorageMock.getItem('ss_user_data_expiry');
      expect(expiryStr).toBeTruthy();
      
      const expiry = parseInt(expiryStr!, 10);
      // Should be approximately 1 hour from now (3600000ms)
      expect(expiry).toBeGreaterThanOrEqual(beforeTime + 3600000);
      expect(expiry).toBeLessThanOrEqual(afterTime + 3600000);
    });

    it('should set expiry time with custom TTL', () => {
      const customTTL = 1800000; // 30 minutes
      const beforeTime = Date.now();
      setUserCache(mockUser, customTTL);
      const afterTime = Date.now();
      
      const expiryStr = localStorageMock.getItem('ss_user_data_expiry');
      const expiry = parseInt(expiryStr!, 10);
      
      expect(expiry).toBeGreaterThanOrEqual(beforeTime + customTTL);
      expect(expiry).toBeLessThanOrEqual(afterTime + customTTL);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock setItem to throw an error
      vi.spyOn(localStorageMock, 'setItem').mockImplementationOnce(() => {
        throw new Error('localStorage is full');
      });
      
      // Should not throw
      expect(() => setUserCache(mockUser)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserCache', () => {
    it('should retrieve user data from localStorage', () => {
      setUserCache(mockUser);
      const retrieved = getUserCache();
      
      expect(retrieved).toEqual(mockUser);
    });

    it('should return null if no user data exists', () => {
      const retrieved = getUserCache();
      expect(retrieved).toBeNull();
    });

    it('should return null if cache has expired', () => {
      // Set cache with past expiry time
      localStorageMock.setItem('ss_user_data', JSON.stringify(mockUser));
      localStorageMock.setItem('ss_user_data_expiry', (Date.now() - 1000).toString());
      
      const retrieved = getUserCache();
      expect(retrieved).toBeNull();
      
      // Should also clear the expired cache
      expect(localStorageMock.getItem('ss_user_data')).toBeNull();
      expect(localStorageMock.getItem('ss_user_data_expiry')).toBeNull();
    });

    it('should return data if cache has not expired', () => {
      // Set cache with future expiry time
      localStorageMock.setItem('ss_user_data', JSON.stringify(mockUser));
      localStorageMock.setItem('ss_user_data_expiry', (Date.now() + 10000).toString());
      
      const retrieved = getUserCache();
      expect(retrieved).toEqual(mockUser);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock getItem to throw an error
      vi.spyOn(localStorageMock, 'getItem').mockImplementationOnce(() => {
        throw new Error('localStorage access denied');
      });
      
      const retrieved = getUserCache();
      expect(retrieved).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid JSON data gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      localStorageMock.setItem('ss_user_data', 'invalid json');
      localStorageMock.setItem('ss_user_data_expiry', (Date.now() + 10000).toString());
      
      const retrieved = getUserCache();
      expect(retrieved).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearUserCache', () => {
    it('should remove user data from localStorage', () => {
      setUserCache(mockUser);
      
      expect(localStorageMock.getItem('ss_user_data')).toBeTruthy();
      expect(localStorageMock.getItem('ss_user_data_expiry')).toBeTruthy();
      
      clearUserCache();
      
      expect(localStorageMock.getItem('ss_user_data')).toBeNull();
      expect(localStorageMock.getItem('ss_user_data_expiry')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.spyOn(localStorageMock, 'removeItem').mockImplementationOnce(() => {
        throw new Error('localStorage access denied');
      });
      
      expect(() => clearUserCache()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasValidUserCache', () => {
    it('should return true if valid cache exists', () => {
      setUserCache(mockUser);
      expect(hasValidUserCache()).toBe(true);
    });

    it('should return false if no cache exists', () => {
      expect(hasValidUserCache()).toBe(false);
    });

    it('should return false if cache has expired', () => {
      localStorageMock.setItem('ss_user_data', JSON.stringify(mockUser));
      localStorageMock.setItem('ss_user_data_expiry', (Date.now() - 1000).toString());
      
      expect(hasValidUserCache()).toBe(false);
    });
  });

  describe('updateUserCache', () => {
    it('should update specific fields in cached user data', () => {
      setUserCache(mockUser);
      
      updateUserCache({ display_name: 'John D.' });
      
      const updated = getUserCache();
      expect(updated?.display_name).toBe('John D.');
      expect(updated?.username).toBe(mockUser.username); // Other fields unchanged
    });

    it('should update multiple fields at once', () => {
      setUserCache(mockUser);
      
      updateUserCache({
        display_name: 'John D.',
        timezone: 'America/Los_Angeles',
      });
      
      const updated = getUserCache();
      expect(updated?.display_name).toBe('John D.');
      expect(updated?.timezone).toBe('America/Los_Angeles');
      expect(updated?.username).toBe(mockUser.username);
    });

    it('should do nothing if no cache exists', () => {
      updateUserCache({ display_name: 'Test' });
      
      const cache = getUserCache();
      expect(cache).toBeNull();
    });
  });

  describe('getUserField', () => {
    it('should retrieve specific field from cached user data', () => {
      setUserCache(mockUser);
      
      expect(getUserField('username')).toBe('johndoe');
      expect(getUserField('first_name')).toBe('John');
      expect(getUserField('display_name')).toBe('Johnny');
    });

    it('should return undefined if no cache exists', () => {
      expect(getUserField('username')).toBeUndefined();
    });

    it('should return undefined if field does not exist', () => {
      setUserCache(mockUser);
      expect(getUserField('email' as any)).toBeUndefined();
    });
  });

  describe('getUserDisplayName', () => {
    it('should return display_name if available', () => {
      setUserCache(mockUser);
      expect(getUserDisplayName()).toBe('Johnny');
    });

    it('should fallback to full_name if display_name not available', () => {
      const userWithoutDisplayName = { ...mockUser, display_name: undefined };
      setUserCache(userWithoutDisplayName);
      expect(getUserDisplayName()).toBe('John Doe');
    });

    it('should fallback to username if neither display_name nor full_name available', () => {
      const userWithoutNames = { 
        ...mockUser, 
        display_name: undefined, 
        full_name: undefined 
      };
      setUserCache(userWithoutNames);
      expect(getUserDisplayName()).toBe('johndoe');
    });

    it('should return "User" if no cache exists', () => {
      expect(getUserDisplayName()).toBe('User');
    });

    it('should return "User" if all name fields are missing', () => {
      const userWithoutAnyName = { 
        ...mockUser, 
        display_name: undefined, 
        full_name: undefined,
        username: undefined as any
      };
      setUserCache(userWithoutAnyName);
      expect(getUserDisplayName()).toBe('User');
    });
  });

  describe('getUserInitials', () => {
    it('should generate initials from first and last name', () => {
      setUserCache(mockUser);
      expect(getUserInitials()).toBe('JD');
    });

    it('should handle missing last name', () => {
      const userWithoutLastName = { ...mockUser, last_name: '' };
      setUserCache(userWithoutLastName);
      expect(getUserInitials()).toBe('J');
    });

    it('should handle missing first name', () => {
      const userWithoutFirstName = { ...mockUser, first_name: '' };
      setUserCache(userWithoutFirstName);
      expect(getUserInitials()).toBe('D');
    });

    it('should fallback to username first letter if names missing', () => {
      const userWithoutNames = { 
        ...mockUser, 
        first_name: '', 
        last_name: '' 
      };
      setUserCache(userWithoutNames);
      expect(getUserInitials()).toBe('J'); // 'johndoe' -> 'J'
    });

    it('should return "US" if no cache exists', () => {
      expect(getUserInitials()).toBe('US');
    });

    it('should return "US" if all name fields are missing', () => {
      const userWithoutAnyName = { 
        ...mockUser, 
        first_name: '', 
        last_name: '',
        username: undefined as any
      };
      setUserCache(userWithoutAnyName);
      expect(getUserInitials()).toBe('US');
    });

    it('should convert initials to uppercase', () => {
      const userWithLowercaseNames = { 
        ...mockUser, 
        first_name: 'john', 
        last_name: 'doe' 
      };
      setUserCache(userWithLowercaseNames);
      expect(getUserInitials()).toBe('JD');
    });

    it('should only take first two letters', () => {
      setUserCache(mockUser);
      const initials = getUserInitials();
      expect(initials.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full user lifecycle', () => {
      // Login - set cache
      setUserCache(mockUser);
      expect(hasValidUserCache()).toBe(true);
      expect(getUserDisplayName()).toBe('Johnny');
      expect(getUserInitials()).toBe('JD');
      
      // Update profile
      updateUserCache({ display_name: 'JD' });
      expect(getUserDisplayName()).toBe('JD');
      
      // Logout - clear cache
      clearUserCache();
      expect(hasValidUserCache()).toBe(false);
      expect(getUserDisplayName()).toBe('User');
      expect(getUserInitials()).toBe('US');
    });

    it('should handle cache expiration during session', () => {
      // Set cache with very short TTL
      setUserCache(mockUser, 1); // 1ms TTL
      
      // Wait for expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(hasValidUserCache()).toBe(false);
          expect(getUserCache()).toBeNull();
          resolve(undefined);
        }, 10);
      });
    });
  });
});
