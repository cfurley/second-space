# CWE-22: Path Traversal Vulnerability - Security Implementation Guide

## Overview

This document describes the security fixes implemented to prevent **CWE-22: Improper Limitation of a Pathname to a Restricted Directory** (Path Traversal) vulnerabilities in the Second Space application.

### What is CWE-22?

CWE-22 occurs when an application uses untrusted user input to construct a file path, allowing attackers to access files outside the intended directory. Example attacks:

- `../../etc/passwd` - Access system files
- `..\..\windows\system32` - Windows directory traversal
- `/uploads/../../config.json` - Access configuration files
- Null byte injection: `file.jpg%00.php` - Bypass extension checks

## Implementation

### 1. Security Utility Module

**Location:** `backend/src/utils/pathSecurity.js`

Provides four core security functions:

#### `resolveSafePath(rootDir, unsafePath)`
Safely resolves paths, ensuring they stay within the root directory.

```javascript
import { resolveSafePath } from '../utils/pathSecurity.js';

const uploadsRoot = path.join(process.cwd(), 'uploads');

// Safe usage
const safePath = resolveSafePath(uploadsRoot, 'documents/file.pdf');
// Returns: /path/to/uploads/documents/file.pdf

// Blocked attempts
resolveSafePath(uploadsRoot, '../../etc/passwd');      // Throws error
resolveSafePath(uploadsRoot, '../../../config.json');  // Throws error
```

**How it works:**
1. Normalizes both root and target paths to absolute paths
2. Resolves relative path segments (`.`, `..`, etc.)
3. Verifies the resolved path starts with the root directory
4. Throws an error if traversal is detected

#### `sanitizeFilename(filename, maxLength=255)`
Sanitizes user-provided filenames to remove path traversal characters.

```javascript
import { sanitizeFilename } from '../utils/pathSecurity.js';

// Valid filenames pass through
sanitizeFilename('document.pdf');           // ✓ 'document.pdf'
sanitizeFilename('my-file_2024.jpg');       // ✓ 'my-file_2024.jpg'

// Dangerous characters are removed
sanitizeFilename('../../etc/passwd');        // ✗ Throws error
sanitizeFilename('path/to/file.txt');        // ✓ 'pathtofile.txt' (slashes removed)
sanitizeFilename('..hidden.txt');            // ✓ 'hidden.txt' (leading dots removed)
sanitizeFilename('file\0.txt');              // ✓ 'file.txt' (null bytes removed)
```

**Protections:**
- Removes path separators (`/`, `\`)
- Removes leading and embedded dots (`..`, `.`)
- Removes control characters (0x00-0x1F, 0x7F)
- Removes dangerous shell characters (`<`, `>`, `:`, `"`, `|`, `?`, `*`)
- Limits filename length to 255 characters

#### `validateSafePathExists(rootDir, unsafePath)`
Combines safe path resolution with file existence checking.

```javascript
const uploadsRoot = path.join(process.cwd(), 'uploads');

try {
  const exists = await validateSafePathExists(uploadsRoot, 'image.jpg');
  if (exists) {
    // File exists and is safe to access
  }
} catch (error) {
  // Path traversal detected or file not found
}
```

#### `validateSafeFileRead(rootDir, unsafePath)`
Validates a file is safe to read (exists and is readable).

```javascript
const uploadsRoot = path.join(process.cwd(), 'uploads');

try {
  const safePath = await validateSafeFileRead(uploadsRoot, 'docs/file.pdf');
  const content = await fs.promises.readFile(safePath);
  // Safe to use content
} catch (error) {
  if (error.message.includes('Path traversal')) {
    // Attack attempt
  } else if (error.message.includes('not found')) {
    // File doesn't exist
  }
}
```

### 2. Integration with Media Services

**Location:** `backend/src/services/mediaServices.js`

The media service now validates filenames during file upload:

```javascript
import { sanitizeFilename } from '../utils/pathSecurity.js';

async function generateFilepath(media) {
  if (!media || !media.filename) throw new Error("Missing filename");

  // Validate filename against path traversal attacks
  try {
    sanitizeFilename(media.filename);
  } catch (error) {
    throw new Error(`Invalid filename: ${error.message}`);
  }

  // Continue with rest of filepath generation...
}
```

**Security flow:**
1. User uploads file with `filename`
2. `sanitizeFilename()` checks for malicious patterns
3. Extension whitelist validation (already in place)
4. MIME type validation via magic bytes (already in place)
5. Server generates secure filepath using crypto hash
6. File is written to disk in restricted uploads directory

### 3. Test Coverage

**Location:** `backend/src/utils/__tests__/pathSecurity.test.js`

Comprehensive tests covering:
- Valid filename acceptance
- Path traversal rejection (`..`, `../../`, etc.)
- Path separator removal (`/`, `\`)
- Control character removal (null bytes, etc.)
- Dangerous character removal (`<`, `>`, etc.)
- Length truncation
- Nested path handling

Run tests with:
```bash
npm test -- pathSecurity.test.js
```

## Security Best Practices

### 1. Always Use the Security Utilities

❌ **Vulnerable:**
```javascript
const filePath = path.join(uploadsRoot, userProvidedFilename);
const content = await fs.promises.readFile(filePath);
```

✅ **Secure:**
```javascript
const sanitized = sanitizeFilename(userProvidedFilename);
const filePath = resolveSafePath(uploadsRoot, sanitized);
const content = await fs.promises.readFile(filePath);
```

### 2. Validate at Multiple Layers

1. **Input validation:** Use `sanitizeFilename()` on user input
2. **Path validation:** Use `resolveSafePath()` before file operations
3. **File validation:** Check MIME types with magic bytes (already implemented)
4. **Access control:** Verify user owns the file before serving it (database check)

### 3. Define Explicit Root Directories

```javascript
// Define uploads root explicitly
const uploadsRoot = path.join(process.cwd(), 'uploads');

// Don't allow arbitrary root directories
// ❌ const uploadsRoot = req.body.uploadDir;  // VULNERABLE!

// Use resolveSafePath for any user-provided relative path
const safeFilePath = resolveSafePath(uploadsRoot, userFilename);
```

### 4. Whitelist File Extensions

The application already implements this. Always validate:
- Extension against whitelist (`.jpg`, `.pdf`, etc.)
- MIME type via magic bytes (prevents disguised files)

### 5. Use Secure Filenames

Server generates filenames using crypto:
```javascript
const hash = crypto.randomBytes(16).toString("hex");
const filename = `${hash}${ext}`;  // E.g., "a1b2c3d4e5f6g7h8.jpg"
```

This prevents users from controlling the actual filesystem path.

## Attack Scenarios & Mitigations

### Scenario 1: Directory Traversal in Upload

**Attack:**
```javascript
// User uploads with filename: "../../etc/passwd"
POST /api/media
{
  "filename": "../../etc/passwd",
  "container_id": "123",
  "file_size": 100,
  "base64": "..."
}
```

**Mitigation:**
- `sanitizeFilename("../../etc/passwd")` throws error
- Upload is rejected before file write
- Database is never updated

### Scenario 2: Null Byte Injection

**Attack:**
```javascript
// Filename: "shell.php\0.jpg"
// Intended to bypass .jpg validation and execute PHP
```

**Mitigation:**
- `sanitizeFilename()` removes null bytes
- Becomes: `"shell.phpjpg"` (invalid)
- Extension whitelist rejects it

### Scenario 3: Download Path Traversal

**Attack:**
```javascript
// Even if user only has filename from DB, they could try:
GET /api/media/123/download?filename=../../etc/passwd
```

**Mitigation:**
- Always validate filepath against uploadsRoot
- Use database to verify ownership
- Never trust user-supplied paths in download requests

## Configuration

### Environment Variables

Consider setting these for better security:

```bash
# Explicit uploads directory (not relative)
UPLOADS_ROOT=/var/uploads

# Maximum file size (bytes)
MAX_FILE_SIZE=20971520  # 20 MB

# Allowed extensions (comma-separated)
ALLOWED_EXTENSIONS=.jpg,.png,.gif,.pdf,.txt,.json
```

## Deployment Checklist

- [ ] Review `pathSecurity.js` utility functions
- [ ] Verify media service uses `sanitizeFilename()` on all uploads
- [ ] Run test suite: `npm test`
- [ ] Enable file upload form input validation on frontend
- [ ] Set appropriate file system permissions on uploads directory
- [ ] Monitor logs for rejected files or traversal attempts
- [ ] Review any other file I/O operations (config files, logs, etc.)
- [ ] Document the security measures in API documentation

## References

- **CWE-22:** https://cwe.mitre.org/data/definitions/22.html
- **OWASP Path Traversal:** https://owasp.org/www-community/attacks/Path_Traversal
- **Node.js Path Security:** https://nodejs.org/en/docs/guides/security/#path-traversal
- **File Upload Security:** https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload

## Testing Path Traversal Manually

To test the security measures:

```javascript
import { sanitizeFilename, resolveSafePath } from './pathSecurity.js';

// Test 1: Sanitize filenames
console.log(sanitizeFilename('document.pdf'));          // ✓ Safe
console.log(sanitizeFilename('../../etc/passwd'));      // ✗ Throws error

// Test 2: Resolve safe paths
const root = '/uploads';
console.log(resolveSafePath(root, 'images/pic.jpg'));  // ✓ Safe
console.log(resolveSafePath(root, '../../etc/passwd')); // ✗ Throws error

// Test 3: Real world scenario
const userFilename = '../../etc/passwd';
try {
  const sanitized = sanitizeFilename(userFilename);
  const safePath = resolveSafePath(root, sanitized);
  // File operations here
} catch (error) {
  console.log('Security check failed:', error.message);
  // Reject the request
}
```

## Future Enhancements

1. **Rate Limiting:** Limit file upload requests per user
2. **Malware Scanning:** Integrate ClamAV or similar for uploaded files
3. **Quarantine:** Quarantine suspicious uploads for review
4. **Logging:** Log all path traversal attempts and rejected uploads
5. **Signed URLs:** Use signed download URLs instead of direct file paths
6. **Cloud Storage:** Move uploads to S3/cloud storage with IAM controls

## Questions or Issues?

If you discover a security vulnerability or have questions about these implementations, please report it following responsible disclosure practices.
