import pool from "../db/index.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { sanitizeFilename } from "../utils/pathSecurity.js";

// maximum file size allowed (bytes). 20 MB default.
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Whitelist of allowed file extensions with their corresponding MIME types.
 * Maps extensions to accepted MIME types detected via magic bytes.
 */
const ALLOWED_EXTENSIONS = {
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".gif": ["image/gif"],
  ".webp": ["image/webp"],
  ".bmp": ["image/bmp"],
  ".svg": ["image/svg+xml"],
  ".txt": ["text/plain"],
  ".json": ["application/json"],
};

/**
 * Validates that the file buffer's actual MIME type (detected via magic bytes)
 * matches the declared extension.
 *
 * @param {Buffer} buffer - The file content buffer
 * @param {string} ext - The file extension (e.g., ".jpg")
 * @returns {Promise<boolean>} - true if MIME type matches, false otherwise
 * @throws {Error} - if extension is not in whitelist
 */
async function validateMimeType(buffer, ext) {
  const extLower = ext.toLowerCase();

  // Verify extension is whitelisted
  if (!ALLOWED_EXTENSIONS[extLower]) {
    throw new Error(`File extension "${ext}" is not allowed.`);
  }

  // Detect actual file type from magic bytes
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    // For plain text and JSON files, magic bytes detection might not work
    // Fallback to allowing .txt and .json if no MIME type detected
    if ([".txt", ".json"].includes(extLower)) {
      return true;
    }
    throw new Error(
      `Could not determine MIME type for file with extension "${ext}".`
    );
  }

  // Check if detected MIME type is in the whitelist for this extension
  const allowedMimes = ALLOWED_EXTENSIONS[extLower];
  if (!allowedMimes.includes(fileType.mime)) {
    throw new Error(
      `File content MIME type "${fileType.mime}" does not match extension "${ext}". ` +
        `Expected one of: ${allowedMimes.join(", ")}`
    );
  }

  return true;
}

/*
  mediaServices.js

  Overview / How this layer fits in
  - The controller accepts validated metadata from clients (via `mediaModel.fromJson`).
  - The controller then calls into these service functions which are responsible
    for storage decisions (generating server-side filepaths) and for performing
    database operations.
  - insertMediaToDatabase() currently does two distinct things:
    1) If provided, it writes the file payload (base64) to disk under
       `backend/uploads/<type>/<hash><ext>`.
    2) It inserts the media metadata row into the DB referencing that path.

  Important notes and tradeoffs
  - Atomicity: the current flow writes the file to disk first, then inserts
    the DB row. If the DB insert fails, the file will be left on disk. For
    robust operations you should consider one of these strategies:
      * write to a temporary location, perform the DB insert within a
        transaction, and on success move the file into final place; on
        failure delete the temp file.
      * perform the DB insert first with a temporary placeholder filepath,
        then write the file and finalize the record; if file write fails,
        roll back the DB insert.
      * use an external object store (S3) and do single-operation uploads
        that are externally consistent, possibly using signed upload URLs.

  - Security: filename validation is intentionally strict (one period, no
    slashes, constrained extensions). Additional hardening steps implemented:
      * Extension whitelist validation to prevent unsupported file types
      * MIME type validation via magic bytes (file-type library) to ensure
        file content matches the declared extension. This prevents:
        - Attackers bypassing extension checks by uploading malicious files
          with misleading extensions (e.g., executable as .txt)
        - Models or controllers inadvertently accepting dangerous types
      * File size validation (20MB limit) to prevent denial of service
    
    Additional security recommendations for future enhancements:
      * Scan user uploads with a virus/malware scanner before moving to
        permanent storage
      * Enforce per-user storage quotas and rate limits to avoid abuse
      * Consider moving uploads to isolated storage or cloud object store

  - Performance: base64 uploads are memory-heavy. For larger files use
    streaming multipart uploads (e.g., `multer` or write stream handling)
    rather than decoding base64 in-memory.

  - Configuration: the uploads root is resolved heuristically. Consider
    exposing `UPLOADS_ROOT` as an environment variable for predictable
    behavior across environments (local dev, CI, Docker, production).

  - Tests: current service tests write to `backend/uploads`. For faster and
    more hermetic tests you can mock `fs.promises.writeFile` or use a
    temporary directory which the tests clean up.
*/

/**
 * Get media by space ID via the containers relationship.
 * Returns all media in a space that belongs to containers in that space.
 */
const getMediaBySpaceId = async (spaceId) => {
  try {
    if (spaceId == null) {
      return { success: false, status: 400, error: "No space id provided." };
    }

    const query = `
      SELECT m.* FROM media m
      JOIN containers c ON m.container_id = c.id
      WHERE c.space_id = $1 AND m.deleted = 0
      ORDER BY m.create_date_utc DESC
    `;
    const result = await pool.query(query, [spaceId]);

    if (!result || result.rows.length === 0) {
      return { success: false, status: 404, error: "No media found." };
    }

    return { success: true, status: 200, data: result.rows };
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Get media either by the owner userId (via containers.created_by_user_id)
 * or by media id directly.
 */
const getMedia = async (userId, mediaId) => {
  try {
    if (userId == null && mediaId == null) {
      return { success: false, status: 400, error: "No id provided." };
    }

    let result;
    if (userId) {
      const query = `
        SELECT m.* FROM media m
        JOIN containers c ON m.container_id = c.id
        WHERE c.created_by_user_id = $1 AND m.deleted = 0
        ORDER BY m.create_date_utc DESC
      `;
      result = await pool.query(query, [userId]);
    } else {
      const query = `SELECT * FROM media WHERE id = $1 AND deleted = 0`;
      result = await pool.query(query, [mediaId]);
    }

    if (!result || result.rows.length === 0) {
      return { success: false, status: 404, error: "No media found." };
    }

    return { success: true, status: 200, data: result.rows };
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

const insertMediaToDatabase = async (media) => {
  if (!media) {
    return { success: false, status: 400, error: "Media was not given." };
  }
  // Generate server-side filepath; do NOT use user-provided filepath
  try {
    const filepath = await generateFilepath(media);
    
    // Sanitize filename before storing in database
    const sanitizedFilename = sanitizeFilename(media.filename);

    // Remember whether generateFilepath wrote a file to disk (it writes only when base64 provided)
    const wroteFile = !!(media.base64 && typeof media.base64 === "string");

    const query = `
      INSERT INTO media (
        container_id, filename, filepath, file_size, video_length,
        create_date_utc, update_date_utc, delete_date_utc, deleted
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id;
    `;

    const values = [
      media.container_id,
      sanitizedFilename,
      filepath,
      media.file_size,
      media.video_length ?? null,
      media.create_date_utc ? new Date(media.create_date_utc) : new Date(),
      null,
      null,
      0,
    ];

    try {
      const result = await pool.query(query, values);
      if (!result || result.rows.length === 0) {
        // Cleanup any written file to avoid orphaning
        if (wroteFile && filepath) {
          try {
            let relPath = filepath.startsWith("/")
              ? filepath.slice(1)
              : filepath;
            if (relPath.startsWith("uploads/"))
              relPath = relPath.slice("uploads/".length);
            const cwdBase = path.basename(process.cwd());
            const uploadsRoot =
              cwdBase === "backend"
                ? path.join(process.cwd(), "uploads")
                : path.join(process.cwd(), "backend", "uploads");
            const absolutePath = path.join(
              uploadsRoot,
              relPath.replace(/\\/g, "/")
            );
            await fs.promises.unlink(absolutePath);
          } catch (err) {
            if (err.code !== "ENOENT") {
              console.log("Failed to cleanup orphaned file");
              return {
                success: false,
                status: 500,
                error: `Failed to cleanup orphaned file`,
              };
            }
            // ENOENT is fine (file already gone)
          }
        }

        console.log("Media did not insert:", values);
        return { success: false, status: 500, error: "Media did not insert" };
      }

      return {
        success: true,
        status: 200,
        message: `Created media successfully`,
      };
    } catch (dbError) {
      // Attempt to cleanup written file on DB error
      if (wroteFile && filepath) {
        try {
          let relPath = filepath.startsWith("/") ? filepath.slice(1) : filepath;
          if (relPath.startsWith("uploads/"))
            relPath = relPath.slice("uploads/".length);
          const cwdBase = path.basename(process.cwd());
          const uploadsRoot =
            cwdBase === "backend"
              ? path.join(process.cwd(), "uploads")
              : path.join(process.cwd(), "backend", "uploads");
          const absolutePath = path.join(
            uploadsRoot,
            relPath.replace(/\\/g, "/")
          );
          await fs.promises.unlink(absolutePath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.log("Failed to cleanup orphaned file after DB error");
            return {
              success: false,
              status: 500,
              error: `Failed to cleanup orphaned file.`,
            };
          }
        }
      }
      console.log(dbError);
      return { success: false, status: 500, error: "Database Error." };
    }
  } catch (error) {
    console.log(error);
    return { success: false, status: 400, error: error.message };
  }
};

/**
 * Generate a safe filepath for storage based on filename extension and a hash.
 * - validates extension against whitelist
 * - validates file content MIME type via magic bytes
 * - organizes by type under ./uploads/<type>/
 * - returns path stored in DB like `/uploads/<type>/<hash><ext>`
 * - writes file if `media.base64` is present (base64 encoded file content)
 *
 * @throws {Error} - if extension is not whitelisted or MIME type doesn't match
 */
async function generateFilepath(media) {
  if (!media || !media.filename) throw new Error("Missing filename");

  // Validate filename against path traversal attacks
  let sanitizedFilename;
  try {
    sanitizedFilename = sanitizeFilename(media.filename);
  } catch (error) {
    throw new Error(
      `Invalid filename: ${error.message}`
    );
  }

  const ext = path.extname(sanitizedFilename).toLowerCase();

  // Validate extension against whitelist
  if (!ALLOWED_EXTENSIONS[ext]) {
    throw new Error(`File extension "${ext}" is not allowed.`);
  }

  // map extensions to folders
  const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"];
  const textExts = [".txt"];
  const jsonExts = [".json"];

  let folder = "others";
  if (imageExts.includes(ext)) folder = "images";
  else if (textExts.includes(ext)) folder = "text";
  else if (jsonExts.includes(ext)) folder = "json";

  // Determine uploads root:
  // - If process.cwd() ends with 'backend', use process.cwd()/uploads
  // - Otherwise use <repo-root>/backend/uploads
  const cwdBase = path.basename(process.cwd());
  const uploadsRoot =
    cwdBase === "backend"
      ? path.join(process.cwd(), "uploads")
      : path.join(process.cwd(), "backend", "uploads");
  const destDir = path.join(uploadsRoot, folder);
  // ensure directory exists
  await fs.promises.mkdir(destDir, { recursive: true });

  // write file only if base64 content provided
  if (media.base64 && typeof media.base64 === "string") {
    const buffer = Buffer.from(media.base64, "base64");

    // validate buffer's size against max file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error("File too large");
    }

    // Validate MIME type matches the declared extension via magic bytes
    await validateMimeType(buffer, ext);

    return await writeFileWithUniqueName(destDir, ext, buffer);
  }

  // If no base64 content, still return a default path
  // (actual file won't be written, but path is returned for metadata)
  const hash = crypto.randomBytes(16).toString("hex");
  const filename = `${hash}${ext}`;
  return `/uploads/${folder}/${filename}`;
  /**
   * Helper to write a file with a unique name using 'wx' flag.
   * Retries up to 5 times if a collision occurs.
   * Returns the dbPath for the written file.
   */
  async function writeFileWithUniqueName(
    destDir,
    ext,
    buffer,
    maxAttempts = 5
  ) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const hash = crypto.randomBytes(16).toString("hex");
      const filename = `${hash}${ext}`;
      const absolutePath = path.join(destDir, filename);
      try {
        const fileHandle = await fs.promises.open(absolutePath, "wx");
        await fileHandle.write(buffer);
        await fileHandle.close();
        // Return the dbPath for the written file
        return `/uploads/${path.basename(destDir)}/${filename}`;
      } catch (err) {
        if (err.code === "EEXIST") {
          // Collision, try again
          continue;
        } else {
          throw err;
        }
      }
    }
    throw new Error(
      "Failed to generate unique filename after multiple attempts"
    );
  }
}

const updateMediaInDatabase = async (id, media) => {
  if (!id || !media) {
    return { success: false, status: 400, error: "Missing parameters." };
  }

  // Fetch current media row to get filepath and filename
  const selectQuery = `SELECT filename, filepath FROM media WHERE id = $1 AND deleted = 0`;
  try {
    const selectResult = await pool.query(selectQuery, [id]);
    if (!selectResult || selectResult.rows.length === 0) {
      return {
        success: false,
        status: 404,
        error: "Media not found.",
      };
    }
    const { filename: oldFilename, filepath: oldFilepath } =
      selectResult.rows[0];

    // Compute absolute path to old file
    let oldAbsolutePath;
    if (oldFilepath && typeof oldFilepath === "string") {
      let relPath = oldFilepath.startsWith("/")
        ? oldFilepath.slice(1)
        : oldFilepath;
      if (relPath.startsWith("uploads/"))
        relPath = relPath.slice("uploads/".length);
      const cwdBase = path.basename(process.cwd());
      const uploadsRoot =
        cwdBase === "backend"
          ? path.join(process.cwd(), "uploads")
          : path.join(process.cwd(), "backend", "uploads");
      oldAbsolutePath = path.join(uploadsRoot, relPath.replace(/\\/g, "/"));
    }

    // Determine new extension and folder
    let sanitizedFilename;
    try {
      sanitizedFilename = sanitizeFilename(media.filename);
    } catch (error) {
      return {
        success: false,
        status: 400,
        error: `Invalid filename: ${error.message}`,
      };
    }
    const newExt = path.extname(sanitizedFilename).toLowerCase();
    const imageExts = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
    ];
    const textExts = [".txt"];
    const jsonExts = [".json"];
    let folder = "others";
    if (imageExts.includes(newExt)) folder = "images";
    else if (textExts.includes(newExt)) folder = "text";
    else if (jsonExts.includes(newExt)) folder = "json";
    const cwdBase = path.basename(process.cwd());
    const uploadsRoot =
      cwdBase === "backend"
        ? path.join(process.cwd(), "uploads")
        : path.join(process.cwd(), "backend", "uploads");
    const newDestDir = path.join(uploadsRoot, folder);
    await fs.promises.mkdir(newDestDir, { recursive: true });

    // If filename or extension changed, rename file
    let newFilename = media.filename;
    let newAbsolutePath = oldAbsolutePath;
    let newDbFilepath = oldFilepath;
    if (oldFilename !== media.filename && oldAbsolutePath) {
      // Generate new hashed filename for consistency
      const hash = crypto.randomBytes(16).toString("hex");
      newFilename = `${hash}${newExt}`;
      newAbsolutePath = path.join(newDestDir, newFilename);
      newDbFilepath = `/uploads/${folder}/${newFilename}`;
      try {
        await fs.promises.rename(oldAbsolutePath, newAbsolutePath);
      } catch (err) {
        // If file does not exist, treat as success; otherwise, abort
        if (err.code !== "ENOENT") {
          return {
            success: false,
            status: 500,
            error: `Failed to rename file on disk.`,
          };
        }
        // ENOENT: file already gone, continue
      }
    }

    // If new base64 content is provided, overwrite file
    if (media.base64 && typeof media.base64 === "string" && newAbsolutePath) {
      const buffer = Buffer.from(media.base64, "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        return { success: false, status: 400, error: "File too large" };
      }
      await validateMimeType(buffer, newExt);
      try {
        await fs.promises.writeFile(newAbsolutePath, buffer);
      } catch (err) {
        return {
          success: false,
          status: 500,
          error: `Failed to update file on disk.`,
        };
      }
    }

    // Update DB row
    const query = `
      UPDATE media SET
        filename = $1,
        filepath = $2,
        file_size = $3,
        video_length = $4,
        update_date_utc = $5
      WHERE id = $6 AND deleted = 0
      RETURNING id;
    `;
    const values = [
      newFilename,
      newDbFilepath,
      media.file_size,
      media.video_length ?? null,
      new Date(),
      id,
    ];
    const result = await pool.query(query, values);
    if (!result || result.rows.length === 0) {
      return {
        success: false,
        status: 404,
        error: "Media not found or not updated.",
      };
    }
    return {
      success: true,
      status: 200,
      message: `Updated media successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, status: 500, error: "Server Error" };
  }
};

// TODO: Delete the file from disk
const deleteMediaFromDatabase = async (id) => {
  if (!id) {
    return { success: false, status: 400, error: "Missing media id." };
  }

  // First, fetch the media row to get the filepath
  const selectQuery = `SELECT filepath FROM media WHERE id = $1 AND deleted = 0`;
  try {
    const selectResult = await pool.query(selectQuery, [id]);
    if (!selectResult || selectResult.rows.length === 0) {
      return {
        success: false,
        status: 404,
        error: "Media not found or already deleted.",
      };
    }
    const { filepath } = selectResult.rows[0];

    // Compute absolute path to file
    let absolutePath;
    if (filepath && typeof filepath === "string") {
      // Remove leading slash if present
      let relPath = filepath.startsWith("/") ? filepath.slice(1) : filepath;
      if (relPath.startsWith("uploads/"))
        relPath = relPath.slice("uploads/".length);
      // Determine uploads root
      const cwdBase = path.basename(process.cwd());
      const uploadsRoot =
        cwdBase === "backend"
          ? path.join(process.cwd(), "uploads")
          : path.join(process.cwd(), "backend", "uploads");
      absolutePath = path.join(uploadsRoot, relPath.replace(/\\/g, "/"));
    }

    // Delete file from disk if it exists
    if (absolutePath) {
      try {
        await fs.promises.unlink(absolutePath);
      } catch (err) {
        // If file does not exist, treat as success; otherwise, abort
        if (err.code !== "ENOENT") {
          return {
            success: false,
            status: 500,
            error: `Failed to delete file from disk: ${err.message}`,
          };
        }
        // ENOENT: file already gone, continue
      }
    }

    // Now, mark as deleted in DB
    const updateQuery = `
      UPDATE media SET deleted = 1, delete_date_utc = $1
      WHERE id = $2 AND deleted = 0
      RETURNING id;
    `;
    const updateResult = await pool.query(updateQuery, [new Date(), id]);
    if (!updateResult || updateResult.rows.length === 0) {
      return {
        success: false,
        status: 404,
        error: "Media not found or already deleted.",
      };
    }
    return {
      success: true,
      status: 200,
      message: `Deleted media successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, status: 500, error: "Server Error" };
  }
};

export default {
  getMedia,
  getMediaBySpaceId,
  insertMediaToDatabase,
  updateMediaInDatabase,
  deleteMediaFromDatabase,
};
