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
      // Surface backend error fields consistently. Backend often uses { error: "..." }
      const backendMessage =
        (data && (data.message || data.error)) ||
        (typeof data === 'string' ? data : null) ||
        undefined;
      throw new Error(backendMessage || `API Error: ${response.status}`);
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
    // Convert camelCase to snake_case for backend
    const payload = {
      username: userData.username,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
    };
    
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
  // Using localStorage for now since backend routes are commented out
  
  /**
   * Upload media to a space (stored locally)
   * CWE-434: Implements secure file upload validation
   */
  async uploadMedia(formData: FormData) {
    try {
      // Extract form data
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const spaceId = formData.get('spaceId') as string;
      const userId = formData.get('userId') as string;
      const file = formData.get('file') as File;
      
      // CWE-434: Server-side validation (simulated for localStorage)
      const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'txt', 'md'];
      const ALLOWED_MIME_TYPES = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/markdown'
      ];
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      // Validate file extension
      const fileName = file.name.toLowerCase();
      const extension = fileName.split('.').pop() || '';
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        throw new Error(`File type .${extension} not allowed. Server accepts only: ${ALLOWED_EXTENSIONS.join(', ')}`);
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(`File MIME type ${file.type} not allowed`);
      }

      // Validate MIME type matches extension
      const mimeToExt: Record<string, string[]> = {
        'image/png': ['png'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/gif': ['gif'],
        'image/webp': ['webp'],
        'application/pdf': ['pdf'],
        'text/plain': ['txt'],
        'text/markdown': ['md']
      };
      
      const validExtensions = mimeToExt[file.type];
      if (validExtensions && !validExtensions.includes(extension)) {
        throw new Error('File type and extension do not match. Possible MIME type spoofing detected.');
      }

      // Sanitize filename (prevent path traversal)
      const sanitizedName = fileName
        .replace(/[/\\]/g, '') // Remove path separators
        .replace(/\0/g, '') // Remove null bytes
        .replace(/^\.+/, '') // Remove leading dots
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Replace special chars

      // Generate safe filename with timestamp
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const safeFileName = `${timestamp}_${random}_${sanitizedName}`;
      
      // Convert file to base64 for localStorage
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Create media object with security metadata
      const mediaItem = {
        id: `media_${timestamp}_${random}`,
        title,
        description,
        spaceId,
        userId,
        fileName: safeFileName, // Store sanitized filename
        originalFileName: file.name, // Keep original for display
        fileType: file.type,
        fileSize: file.size,
        fileData: base64, // Store the base64 encoded file
        createdAt: new Date().toISOString(),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'file',
        validated: true, // Mark as validated
        uploadedFrom: 'secure-client'
      };
      
      // Get existing media from localStorage
      const existingMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
      
      // Add new media
      existingMedia.push(mediaItem);
      
      // Save back to localStorage
      localStorage.setItem('ss_media', JSON.stringify(existingMedia));

      // Log upload for security monitoring
      console.log('[UPLOAD-LOG]', {
        timestamp: new Date().toISOString(),
        userId,
        spaceId,
        fileName: safeFileName,
        fileType: file.type,
        fileSize: file.size,
        status: 'SUCCESS'
      });
      
      return { 
        success: true, 
        message: 'Media uploaded successfully',
        data: mediaItem 
      };
    } catch (error) {
      // Log failed upload attempt
      console.error('[UPLOAD-LOG]', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'FAILED'
      });
      
      console.error('Error uploading media:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload media');
    }
  },
  
  /**
   * Get media for a space (from localStorage)
   */
  async getMedia(spaceId: string) {
    try {
      const allMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
      const spaceMedia = allMedia.filter((item: any) => item.spaceId === spaceId);
      return { success: true, data: spaceMedia };
    } catch (error) {
      console.error('Error getting media:', error);
      throw new Error('Failed to get media');
    }
  },
  
  /**
   * Delete media by ID (from localStorage)
   */
  async deleteMedia(mediaId: string) {
    try {
      const allMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
      const filtered = allMedia.filter((item: any) => item.id !== mediaId);
      localStorage.setItem('ss_media', JSON.stringify(filtered));
      return { success: true, message: 'Media deleted successfully' };
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media');
    }
  },
  
  // ==================== CONTENT ENDPOINTS ====================
  // For text posts and bookmarks (stored locally)
  
  /**
   * Create a text post
   */
  async createPost(postData: {
    title: string;
    content: string;
    spaceId: string;
    userId?: string;
  }) {
    try {
      const post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...postData,
        type: 'text',
        createdAt: new Date().toISOString(),
        isBookmarked: false
      };
      
      const existingPosts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
      existingPosts.push(post);
      localStorage.setItem('ss_posts', JSON.stringify(existingPosts));
      
      return { success: true, message: 'Post created successfully', data: post };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  },
  
  /**
   * Create a bookmark
   */
  async createBookmark(bookmarkData: {
    title: string;
    url: string;
    notes?: string;
    spaceId: string;
    userId?: string;
  }) {
    try {
      const bookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...bookmarkData,
        type: 'bookmark',
        createdAt: new Date().toISOString(),
        isBookmarked: false
      };
      
      const existingBookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
      existingBookmarks.push(bookmark);
      localStorage.setItem('ss_bookmarks', JSON.stringify(existingBookmarks));
      
      return { success: true, message: 'Bookmark saved successfully', data: bookmark };
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw new Error('Failed to save bookmark');
    }
  },
  
  /**
   * Get all content for a space (posts, media, bookmarks)
   */
  async getSpaceContent(spaceId: string) {
    try {
      const posts = JSON.parse(localStorage.getItem('ss_posts') || '[]')
        .filter((item: any) => item.spaceId === spaceId);
      const media = JSON.parse(localStorage.getItem('ss_media') || '[]')
        .filter((item: any) => item.spaceId === spaceId);
      const bookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]')
        .filter((item: any) => item.spaceId === spaceId);
      
      return { 
        success: true, 
        data: {
          posts,
          media,
          bookmarks,
          all: [...posts, ...media, ...bookmarks].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }
      };
    } catch (error) {
      console.error('Error getting space content:', error);
      throw new Error('Failed to get space content');
    }
  },
  
  /**
   * Toggle bookmark status of any content item
   */
  async toggleBookmark(itemId: string, itemType: 'post' | 'media' | 'bookmark') {
    try {
      const storageKey = itemType === 'post' ? 'ss_posts' : 
                        itemType === 'media' ? 'ss_media' : 'ss_bookmarks';
      
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = items.map((item: any) => 
        item.id === itemId ? { ...item, isBookmarked: !item.isBookmarked } : item
      );
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      return { success: true, message: 'Bookmark toggled successfully' };
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw new Error('Failed to toggle bookmark');
    }
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
