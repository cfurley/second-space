/**
 * Secure File Upload Utility - CWE-434 Protection
 * 
 * This module implements secure file upload handling to prevent:
 * - Unrestricted upload of dangerous file types
 * - Path traversal attacks
 * - MIME type spoofing
 * - Malicious file execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// PHASE 1: STRICT WHITELIST FOR ALLOWED FILE TYPES
// ============================================================================

/**
 * Whitelist of allowed file extensions
 * Only these file types can be uploaded
 */
const ALLOWED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'pdf',
  'txt',
  'md'
]);

/**
 * Whitelist of allowed MIME types
 * Must match the file extension
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown'
]);

/**
 * Mapping of MIME types to their valid extensions
 * Used for double validation
 */
const MIME_TO_EXTENSION = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
  'text/plain': ['txt'],
  'text/markdown': ['md']
};

// ============================================================================
// PHASE 3: SECURE UPLOAD STORAGE CONFIGURATION
// ============================================================================

/**
 * Upload directory - OUTSIDE web root for security
 * Files stored here cannot be directly executed
 */
const UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ============================================================================
// PHASE 4: LOGGING FOR SECURITY MONITORING
// ============================================================================

/**
 * Simple file upload logger
 * Tracks all upload attempts for security monitoring
 */
class UploadLogger {
  constructor() {
    this.logFile = path.join(__dirname, '../../../logs/file-uploads.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...metadata
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to upload log:', error);
    }

    // Also log to console
    console.log(`[${level}] ${message}`, metadata);
  }

  info(message, metadata) {
    this.log('INFO', message, metadata);
  }

  warn(message, metadata) {
    this.log('WARN', message, metadata);
  }

  error(message, metadata) {
    this.log('ERROR', message, metadata);
  }

  suspicious(message, metadata) {
    this.log('SUSPICIOUS', message, metadata);
  }
}

const logger = new UploadLogger();

// ============================================================================
// PHASE 2: MIME TYPE AND EXTENSION VALIDATION
// ============================================================================

/**
 * Validate file extension against whitelist
 * @param {string} filename - Original filename
 * @returns {boolean} - True if extension is allowed
 */
function isExtensionAllowed(filename) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Validate MIME type against whitelist
 * @param {string} mimeType - File MIME type
 * @returns {boolean} - True if MIME type is allowed
 */
function isMimeTypeAllowed(mimeType) {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

/**
 * Verify that MIME type matches file extension
 * Prevents MIME type spoofing attacks
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {boolean} - True if MIME type matches extension
 */
function validateMimeExtensionMatch(filename, mimeType) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  const validExtensions = MIME_TO_EXTENSION[mimeType];
  
  if (!validExtensions) {
    return false;
  }
  
  return validExtensions.includes(ext);
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  // Remove path separators to prevent directory traversal
  let sanitized = filename.replace(/[/\\]/g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Replace spaces and special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '.') {
    sanitized = 'unnamed_file';
  }
  
  return sanitized;
}

/**
 * Generate a unique, safe filename
 * Format: {timestamp}_{random}_{sanitized_original_name}
 * @param {string} originalFilename - Original filename
 * @returns {string} - Unique, safe filename
 */
function generateSafeFilename(originalFilename) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const sanitized = sanitizeFilename(originalFilename);
  
  const ext = path.extname(sanitized);
  const nameWithoutExt = path.basename(sanitized, ext);
  
  return `${timestamp}_${random}_${nameWithoutExt}${ext}`;
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {boolean} - True if size is within limits
 */
function validateFileSize(size) {
  return size > 0 && size <= MAX_FILE_SIZE;
}

// ============================================================================
// MAIN SECURE UPLOAD HANDLER
// ============================================================================

/**
 * Initialize upload directory structure
 * Creates upload directory outside web root if it doesn't exist
 */
function initializeUploadDirectory() {
  if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true, mode: 0o755 });
    logger.info('Created upload directory', { path: UPLOAD_ROOT });
  }

  // Create .htaccess to prevent script execution (for Apache)
  const htaccessPath = path.join(UPLOAD_ROOT, '.htaccess');
  const htaccessContent = `
# Prevent script execution in upload directory
<FilesMatch "\\.(?i:php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi)$">
  Require all denied
</FilesMatch>

# Deny access to all files by default
Order Deny,Allow
Deny from all

# Allow only specific safe file types
<FilesMatch "\\.(?i:png|jpg|jpeg|gif|webp|pdf|txt|md)$">
  Allow from all
</FilesMatch>
  `.trim();

  if (!fs.existsSync(htaccessPath)) {
    fs.writeFileSync(htaccessPath, htaccessContent);
    logger.info('Created .htaccess for upload security');
  }
}

/**
 * Comprehensive file upload validation and handling
 * 
 * @param {Object} fileData - File data object
 * @param {Buffer} fileData.buffer - File content buffer
 * @param {string} fileData.originalFilename - Original filename from client
 * @param {string} fileData.mimeType - MIME type from client
 * @param {number} fileData.size - File size in bytes
 * @param {string} fileData.userId - User ID uploading the file
 * @param {string} fileData.spaceId - Space ID for the file
 * @returns {Object} - Upload result with success status and metadata
 */
async function handleSecureUpload(fileData) {
  const { buffer, originalFilename, mimeType, size, userId, spaceId } = fileData;
  
  const uploadMetadata = {
    originalFilename,
    mimeType,
    size,
    userId,
    spaceId,
    timestamp: new Date().toISOString()
  };

  try {
    // VALIDATION STEP 1: Check file size
    if (!validateFileSize(size)) {
      logger.suspicious('File size validation failed', {
        ...uploadMetadata,
        maxSize: MAX_FILE_SIZE
      });
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // VALIDATION STEP 2: Check file extension
    if (!isExtensionAllowed(originalFilename)) {
      logger.suspicious('Disallowed file extension', uploadMetadata);
      return {
        success: false,
        error: 'File type not allowed. Allowed types: ' + Array.from(ALLOWED_EXTENSIONS).join(', ')
      };
    }

    // VALIDATION STEP 3: Check MIME type
    if (!isMimeTypeAllowed(mimeType)) {
      logger.suspicious('Disallowed MIME type', uploadMetadata);
      return {
        success: false,
        error: 'File MIME type not allowed'
      };
    }

    // VALIDATION STEP 4: Verify MIME type matches extension
    if (!validateMimeExtensionMatch(originalFilename, mimeType)) {
      logger.suspicious('MIME type / extension mismatch', uploadMetadata);
      return {
        success: false,
        error: 'File type mismatch detected'
      };
    }

    // VALIDATION STEP 5: Sanitize and generate safe filename
    const safeFilename = generateSafeFilename(originalFilename);
    const filePath = path.join(UPLOAD_ROOT, safeFilename);

    // Ensure upload directory exists
    initializeUploadDirectory();

    // SECURITY: Double-check path is within upload directory (prevent path traversal)
    const resolvedPath = path.resolve(filePath);
    const resolvedRoot = path.resolve(UPLOAD_ROOT);
    if (!resolvedPath.startsWith(resolvedRoot)) {
      logger.suspicious('Path traversal attempt detected', {
        ...uploadMetadata,
        attemptedPath: filePath
      });
      return {
        success: false,
        error: 'Invalid file path'
      };
    }

    // Write file to disk with restricted permissions
    fs.writeFileSync(filePath, buffer, { mode: 0o644 });

    // Log successful upload
    logger.info('File uploaded successfully', {
      ...uploadMetadata,
      safeFilename,
      storagePath: filePath
    });

    return {
      success: true,
      data: {
        filename: safeFilename,
        originalFilename,
        path: filePath,
        relativePath: `/uploads/${safeFilename}`,
        mimeType,
        size,
        uploadedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    logger.error('File upload error', {
      ...uploadMetadata,
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: 'Failed to upload file due to server error'
    };
  }
}

/**
 * Validate file on the frontend (client-side validation)
 * This is a helper for early validation, but server-side validation is still required
 * 
 * @param {File} file - File object from browser
 * @returns {Object} - Validation result
 */
function validateFileClient(file) {
  const errors = [];

  // Check file size
  if (!validateFileSize(file.size)) {
    errors.push(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check extension
  if (!isExtensionAllowed(file.name)) {
    errors.push(`File type not allowed. Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`);
  }

  // Check MIME type
  if (!isMimeTypeAllowed(file.type)) {
    errors.push('File MIME type not allowed');
  }

  // Check MIME/extension match
  if (!validateMimeExtensionMatch(file.name, file.type)) {
    errors.push('File type mismatch detected');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  handleSecureUpload,
  validateFileClient,
  initializeUploadDirectory,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};

export {
  handleSecureUpload,
  validateFileClient,
  initializeUploadDirectory,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};
