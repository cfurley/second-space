import pool from "../db/index.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// maximum file size allowed (bytes). 20 MB default.
const MAX_FILE_SIZE = 20 * 1024 * 1024;

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
      message: `Created media ${result.rows[0].id} succesfully`,
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

    await fs.promises.writeFile(absolutePath, buffer);
  }

  return dbPath;
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
