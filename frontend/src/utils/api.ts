/**
 * API Configuration and Client for Second Space
 * 
 * This file handles all API communication between frontend and backend.
 * It automatically switches between local development and production URLs.
 */

// Determine the API base URL based on environment
const API_BASE_URL = (import.meta as any).env.PROD 
  ? (import.meta as any).env.VITE_API_URL || 'https://second-space-api.onrender.com'  // Production (update this URL after deploying to Render)
  : 'http://localhost:8080';  // Local development with Docker

console.log('API Base URL:', API_BASE_URL);

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
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
    return apiFetch('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
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
  // (Currently commented out in backend, but ready for when you enable them)
  
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
