/**
 * pathSecurity.js
 *
 * Security utilities to prevent CWE-22 (Path Traversal) vulnerabilities.
 *
 * These functions ensure that untrusted user input cannot be used to access
 * files outside the intended directory structure.
 */

import path from "path";
import fs from "fs";

/**
 * Resolves a file path safely, ensuring it stays within a designated root directory.
 *
 * This function prevents path traversal attacks by:
 * 1. Resolving both the root and the target path to absolute paths
 * 2. Verifying that the target path starts with the root path
 * 3. Throwing an error if traversal outside the root is detected
 *
 * @param {string} rootDir - The allowed root directory (must exist and be absolute)
 * @param {string} unsafePath - The user-provided path segment (potentially malicious)
 * @returns {string} - The safe absolute path if valid
 * @throws {Error} - if the resolved path escapes the root directory
 *
 * @example
 * const uploadsRoot = path.join(process.cwd(), 'uploads');
 * const safeFilepath = resolveSafePath(uploadsRoot, 'documents/file.pdf');
 * // Throws error if trying: resolveSafePath(uploadsRoot, '../../etc/passwd')
 */
export function resolveSafePath(rootDir, unsafePath) {
  if (!rootDir || !unsafePath) {
    throw new Error("Both rootDir and unsafePath are required");
  }

  // Ensure root directory is absolute
  const absoluteRoot = path.isAbsolute(rootDir)
    ? rootDir
    : path.resolve(rootDir);

  // Normalize and resolve the user-provided path relative to root
  // This handles cases like "..", ".", "//", etc.
  const resolvedPath = path.resolve(absoluteRoot, unsafePath);

  // Verify the resolved path is within the root directory
  // Normalize both to handle platform differences and trailing slashes
  const normalizedRoot = path.normalize(absoluteRoot) + path.sep;
  const normalizedResolved = path.normalize(resolvedPath);

  if (!normalizedResolved.startsWith(normalizedRoot)) {
    throw new Error(
      `Path traversal detected: "${unsafePath}" escapes the root directory`
    );
  }

  return resolvedPath;
}

/**
 * Sanitizes a filename to prevent path traversal and other attacks.
 *
 * This function:
 * 1. Removes or replaces path separators (/, \, null bytes)
 * 2. Removes double dots (..) that enable traversal
 * 3. Removes leading dots (., ..) that can bypass restrictions
 * 4. Strips control characters and other dangerous characters
 * 5. Limits filename length to prevent buffer overflow attacks
 *
 * @param {string} filename - The user-provided filename
 * @param {number} maxLength - Maximum allowed length (default: 255)
 * @returns {string} - The sanitized filename
 * @throws {Error} - if filename is empty after sanitization
 *
 * @example
 * sanitizeFilename('../../etc/passwd') // Throws error
 * sanitizeFilename('my-file.pdf')      // Returns 'my-file.pdf'
 * sanitizeFilename('..\\..\\windows\\system.ini') // Throws error
 */
export function sanitizeFilename(filename, maxLength = 255) {
  if (!filename || typeof filename !== "string") {
    throw new Error("Filename must be a non-empty string");
  }

  // Remove null bytes
  let sanitized = filename.replace(/\0/g, "");

  // Remove path separators (forward and back slashes)
  sanitized = sanitized.replace(/[/\\]/g, "");

  // Remove leading dots that could enable directory traversal
  // Examples: "..", ".", "./..", etc.
  sanitized = sanitized.replace(/^\.+/, "");

  // Remove all double dots (path traversal sequences)
  sanitized = sanitized.replace(/\.\./g, "");

  // Remove control characters (0x00-0x1F and 0x7F)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  // Remove other dangerous characters that can cause issues
  // Includes: < > : " | ? * and null/control chars
  sanitized = sanitized.replace(/[<>:"|?*]/g, "");

  // Limit length to prevent buffer overflow or other length-based attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Ensure the result is not empty
  if (!sanitized) {
    throw new Error(
      "Filename is invalid or empty after sanitization. Check for path traversal attempts."
    );
  }

  return sanitized;
}

/**
 * Validates that a path is within a designated root directory and the file exists.
 *
 * Combines safe path resolution with file existence checking.
 *
 * @param {string} rootDir - The allowed root directory
 * @param {string} unsafePath - The user-provided path
 * @returns {Promise<boolean>} - true if path is safe and file exists
 * @throws {Error} - if path traversal is detected or file doesn't exist
 *
 * @example
 * const uploadsRoot = path.join(process.cwd(), 'uploads');
 * const exists = await validateSafePathExists(uploadsRoot, 'images/photo.jpg');
 */
export async function validateSafePathExists(rootDir, unsafePath) {
  const safePath = resolveSafePath(rootDir, unsafePath);

  try {
    const stats = await fs.promises.stat(safePath);
    return stats.isFile();
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`File not found: ${unsafePath}`);
    }
    throw err;
  }
}

/**
 * Validates a file path for safe reading operations.
 *
 * Ensures:
 * 1. Path stays within the root directory
 * 2. File actually exists
 * 3. File is readable
 *
 * @param {string} rootDir - The allowed root directory
 * @param {string} unsafePath - The user-provided path
 * @returns {Promise<string>} - The validated absolute path
 * @throws {Error} - if path is unsafe or file cannot be read
 */
export async function validateSafeFileRead(rootDir, unsafePath) {
  const safePath = resolveSafePath(rootDir, unsafePath);

  try {
    // Check if file exists and is readable
    await fs.promises.access(safePath, fs.constants.R_OK);
    return safePath;
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`File not found: ${unsafePath}`);
    } else if (err.code === "EACCES") {
      throw new Error(`File is not readable: ${unsafePath}`);
    }
    throw err;
  }
}

export default {
  resolveSafePath,
  sanitizeFilename,
  validateSafePathExists,
  validateSafeFileRead,
};
