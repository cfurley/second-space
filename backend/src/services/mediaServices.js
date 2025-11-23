import pool from "../db/index.js";

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
    media.filepath,
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

const updateMediaInDatabase = async (id, media) => {
  if (!id || !media) {
    return { success: false, status: 400, error: "Missing parameters." };
  }

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
    media.filename,
    media.filepath,
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
