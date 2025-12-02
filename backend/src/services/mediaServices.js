import pool from "../db/index.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// maximum file size allowed (bytes). 20 MB default.
const MAX_FILE_SIZE = 20 * 1024 * 1024;

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
    slashes, constrained extensions). Additional hardening steps:
      * Inspect MIME type / magic bytes of the decoded buffer to verify
        that the declared extension matches file content.
      * Scan user uploads with a virus/malware scanner before moving to
        permanent storage.
      * Enforce per-user storage quotas and rate limits to avoid abuse.

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
    return { success: false, status: 400, error: "Media is not given." };
  }
  // Generate server-side filepath; do NOT use user-provided filepath
  try {
    const filepath = await generateFilepath(media);

    const query = `
      INSERT INTO media (
        container_id, filename, filepath, file_size, video_length,
        create_date_utc, update_date_utc, delete_date_utc, deleted
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id;
    `;

    const values = [
      media.container_id,
      media.filename,
      filepath,
      media.file_size,
      media.video_length ?? null,
      media.create_date_utc ? new Date(media.create_date_utc) : new Date(),
      null,
      null,
      0,
    ];

    const result = await pool.query(query, values);
    if (!result || result.rows.length === 0) {
      console.log("Media did not insert:", values);
      return { success: false, status: 500, error: "Media did not insert" };
    }

    return {
      success: true,
      status: 200,
      message: `Created media ${result.rows[0].id} successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, status: 500, error: "Server Error" };
  }
};

/**
 * Generate a safe filepath for storage based on filename extension and a hash.
 * - organizes by type under ./uploads/<type>/
 * - returns path stored in DB like `/uploads/<type>/<hash><ext>`
 * - writes file if `media.base64` is present (base64 encoded file content)
 */
async function generateFilepath(media) {
  if (!media || !media.filename) throw new Error("Missing filename");

  const ext = path.extname(media.filename).toLowerCase();

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

  // create a hashed name
  const hash = crypto.randomBytes(16).toString("hex");
  const filename = `${hash}${ext}`;
  const absolutePath = path.join(destDir, filename);
  const dbPath = `/uploads/${folder}/${filename}`; // store unix-style

  // write file only if base64 content provided
  if (media.base64 && typeof media.base64 === "string") {
    const buffer = Buffer.from(media.base64, "base64");

    // validate size against file_size if provided and MAX_FILE_SIZE
    if (media.file_size && typeof media.file_size === "number") {
      if (media.file_size !== buffer.length) {
        // if mismatch, prefer actual buffer length but reject if exceeds limit
        if (buffer.length > MAX_FILE_SIZE) throw new Error("File too large");
      }
    }

    if (buffer.length > MAX_FILE_SIZE) throw new Error("File too large");

    await writeFileWithUniqueName(destDir, ext, buffer);
  }

  // If file was written, dbPath is returned from helper; otherwise, use original
  if (media.base64 && typeof media.base64 === "string") {
    // dbPath is returned from writeFileWithUniqueName
    return await writeFileWithUniqueName(destDir, ext, Buffer.from(media.base64, "base64"));
  }
  return dbPath;
/**
 * Helper to write a file with a unique name using 'wx' flag.
 * Retries up to 5 times if a collision occurs.
 * Returns the dbPath for the written file.
 */
async function writeFileWithUniqueName(destDir, ext, buffer, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${hash}${ext}`;
    const absolutePath = path.join(destDir, filename);
    try {
      const fileHandle = await fs.promises.open(absolutePath, 'wx');
      await fileHandle.write(buffer);
      await fileHandle.close();
      // Return the dbPath for the written file
      return `/uploads/${path.basename(destDir)}/${filename}`;
    } catch (err) {
      if (err.code === 'EEXIST') {
        // Collision, try again
        continue;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed to generate unique filename after multiple attempts");
}
}

const updateMediaInDatabase = async (id, media) => {
  if (!id || !media) {
    return { success: false, status: 400, error: "Missing parameters." };
  }

  // Do not accept user-provided filepath. We will not move files here.
  const query = `
    UPDATE media SET
      filename = $1,
      file_size = $2,
      video_length = $3,
      update_date_utc = $4
    WHERE id = $5 AND deleted = 0
    RETURNING id;
  `;

  const values = [
    media.filename,
    media.file_size,
    media.video_length ?? null,
    new Date(),
    id,
  ];

  try {
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
      message: `Updated media ${id} succesfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, status: 500, error: "Server Error" };
  }
};

const deleteMediaFromDatabase = async (id) => {
  if (!id) {
    return { success: false, status: 400, error: "Missing media id." };
  }

  const query = `
    UPDATE media SET deleted = 1, delete_date_utc = $1
    WHERE id = $2 AND deleted = 0
    RETURNING id;
  `;

  try {
    const result = await pool.query(query, [new Date(), id]);
    if (!result || result.rows.length === 0) {
      return {
        success: false,
        status: 404,
        error: "Media not found or already deleted.",
      };
    }
    return {
      success: true,
      status: 200,
      message: `Deleted media ${id} succesfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, status: 500, error: "Server Error" };
  }
};

export default {
  getMedia,
  insertMediaToDatabase,
  updateMediaInDatabase,
  deleteMediaFromDatabase,
};
