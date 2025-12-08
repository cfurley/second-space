/**
 * User Cache Utility
 * 
 * Modular caching system for user data with localStorage persistence.
 * This utility provides a centralized way to manage user data across the application,
 * making it easy to expand to other types of cached data in the future.
 */

export interface UserData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  display_name?: string;
  profile_picture_id?: string;
  theme_id?: string;
  timezone?: string;
  last_login_date_utc?: string;
  create_date_utc?: string;
  update_date_utc?: string;
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  USER_KEY: 'ss_user_data',
  EXPIRY_KEY: 'ss_user_data_expiry',
  DEFAULT_TTL_MS: 3600000, // 1 hour (matches backend cache-control)
} as const;

/**
 * Set user data in cache with optional TTL (time-to-live)
 * @param userData - User data object to cache
 * @param ttlMs - Time to live in milliseconds (default: 1 hour)
 */
export function setUserCache(userData: UserData, ttlMs: number = CACHE_CONFIG.DEFAULT_TTL_MS): void {
  try {
    const expiryTime = Date.now() + ttlMs;
    localStorage.setItem(CACHE_CONFIG.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(CACHE_CONFIG.EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error setting user cache:', error);
    // Fail silently - localStorage might be disabled (private mode, etc.)
  }
}

/**
 * Get user data from cache
 * @returns User data object or null if not found/expired
 */
export function getUserCache(): UserData | null {
  try {
    const expiryStr = localStorage.getItem(CACHE_CONFIG.EXPIRY_KEY);
    
    // Check if cache has expired
    if (expiryStr) {
      const expiryTime = parseInt(expiryStr, 10);
      if (Date.now() > expiryTime) {
        // Cache expired, clear it
        clearUserCache();
        return null;
      }
    }
    
    const userDataStr = localStorage.getItem(CACHE_CONFIG.USER_KEY);
    if (!userDataStr) {
      return null;
    }
    
    return JSON.parse(userDataStr) as UserData;
  } catch (error) {
    console.error('Error getting user cache:', error);
    return null;
  }
}

/**
 * Clear user data from cache
 */
export function clearUserCache(): void {
  try {
    localStorage.removeItem(CACHE_CONFIG.USER_KEY);
    localStorage.removeItem(CACHE_CONFIG.EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
}

/**
 * Check if user cache exists and is valid
 * @returns true if cache exists and hasn't expired
 */
export function hasValidUserCache(): boolean {
  return getUserCache() !== null;
}

/**
 * Update specific fields in the cached user data
 * @param updates - Partial user data to update
 */
export function updateUserCache(updates: Partial<UserData>): void {
  const currentUser = getUserCache();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    setUserCache(updatedUser);
  }
}

/**
 * Get a specific field from cached user data
 * @param field - Field name to retrieve
 * @returns Field value or undefined if not found
 */
export function getUserField<K extends keyof UserData>(field: K): UserData[K] | undefined {
  const user = getUserCache();
  return user?.[field];
}

/**
 * Get display name for the user (falls back to username)
 * @returns Display name, full name, or username
 */
export function getUserDisplayName(): string {
  const user = getUserCache();
  if (!user) return 'User';
  
  return user.display_name || user.full_name || user.username || 'User';
}

/**
 * Get user initials for avatar display
 * @returns Two-letter initials based on first and last name
 */
export function getUserInitials(): string {
  const user = getUserCache();
  if (!user) return 'US';
  
  const first = user.first_name?.[0]?.toUpperCase() || '';
  const last = user.last_name?.[0]?.toUpperCase() || '';
  
  return (first + last).slice(0, 2) || user.username?.[0]?.toUpperCase() || 'US';
}
