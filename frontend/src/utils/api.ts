/**
 * API Configuration and Client for Second Space
 * 
 * This file handles all API communication between frontend and backend.
 * It automatically switches between local development and production URLs.
 */

// Determine if we're running in Docker (port 80) or local dev (port 3000)
const isDocker = window.location.port === '80' || window.location.port === '';
const isLocalDev = window.location.port === '3000' || window.location.port === '5173';

// Determine the API base URL based on environment
let API_BASE_URL: string;

if (isDocker) {
  // Running in Docker - use nginx proxy
  API_BASE_URL = '/api';
  console.log('?? Docker mode: Using nginx proxy at /api');
} else if (isLocalDev) {
  // Local development - direct to backend
  API_BASE_URL = 'http://localhost:8080';
  console.log('?? Dev mode: Direct to backend at http://localhost:8080');
} else if ((import.meta as any).env.PROD) {
  // Production - use environment variable or default
  API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://second-space-api.onrender.com';
  console.log('?? Production mode:', API_BASE_URL);
} else {
  // Fallback
  API_BASE_URL = 'http://localhost:8080';
  console.log('?? Fallback mode: http://localhost:8080');
}

console.log('API Base URL:', API_BASE_URL);
console.log('Window location:', window.location.href);

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  try {
    console.log(`?? Fetching: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    console.log(`?? Response status: ${response.status} for ${url}`);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('? Non-JSON response:', text.substring(0, 200));
      throw new Error(`Expected JSON response but got ${contentType}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('? API Error:', data);
      throw new Error(data.message || data.error || `API Error: ${response.status}`);
    }
    
    console.log('? Success:', url);
    return data;
  } catch (error) {
    console.error('? API Error:', error);
    throw error;
  }
}

/**
 * API Client - All your backend endpoints
 */
export const api = {
  // ==================== USER ENDPOINTS ====================
  
  /**
   * Authenticate user login
   */
  async login(username: string, password: string) {
    return apiFetch('/user/authentication', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  /**
   * Create a new user account
   */
  async createUser(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email?: string;
  }) {
    // Convert camelCase to snake_case for backend
    const payload = {
      username: userData.username,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
    };
    
    console.log('?? Creating user:', { username: payload.username, firstName: payload.first_name });
    
    return apiFetch('/user', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  /**
   * Get user by ID
   */
  async getUser(userId: string) {
    return apiFetch(`/user/${userId}`);
  },
  
  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string) {
    return apiFetch(`/user/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword }),
    });
  },
  
  /**
   * Delete user account
   */
  async deleteUser(userId: string) {
    return apiFetch(`/user/${userId}`, {
      method: 'DELETE',
    });
  },
  
  // ==================== SPACE ENDPOINTS ====================
  
  /**
   * Get all spaces for a user
   */
  async getSpaces(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return apiFetch(`/spaces${query}`);
  },
  
  /**
   * Get a specific space by ID
   */
  async getSpace(spaceId: string) {
    return apiFetch(`/spaces/${spaceId}`);
  },
  
  /**
   * Create a new space
   */
  async createSpace(spaceData: {
    name: string;
    description?: string;
    userId: string;
  }) {
    return apiFetch('/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  },
  
  /**
   * Update a space
   */
  async updateSpace(spaceId: string, updates: {
    name?: string;
    description?: string;
  }) {
    return apiFetch(`/spaces/${spaceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  /**
   * Delete a space
   */
  async deleteSpace(spaceId: string) {
    return apiFetch(`/spaces/${spaceId}`, {
      method: 'DELETE',
    });
  },
  
  // ==================== THEME ENDPOINTS ====================
  
  /**
   * Get all available themes
   */
  async getThemes() {
    return apiFetch('/themes');
  },
  
  /**
   * Get a specific theme by ID
   */
  async getTheme(themeId: string) {
    return apiFetch(`/themes/${themeId}`);
  },
  
  // ==================== MEDIA ENDPOINTS ====================
  
  /**
   * Upload media to a space
   */
  async uploadMedia(formData: FormData) {
    // Note: For file uploads, we don't set Content-Type (browser sets it with boundary)
    return fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  /**
   * Get media for a space
   */
  async getMedia(spaceId: string) {
    return apiFetch(`/media?spaceId=${spaceId}`);
  },
  
  // ==================== HEALTH CHECK ====================
  
  /**
   * Check if backend is alive
   */
  async healthCheck() {
    return apiFetch('/');
  },
};

// Export the base URL for direct use if needed
export { API_BASE_URL };

// Type definitions for API responses
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  mainColor: string;
  caretColor: string;
  subColor: string;
  subAltColor: string;
  textColor: string;
  errorColor: string;
  errorExtraColor: string;
  colorfulErrorColor: string;
  colorfulErrorExtraColor: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
