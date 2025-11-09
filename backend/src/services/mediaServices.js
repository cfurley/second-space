import pool from "../db/index.js";

/**
 * Gets spaced based off userId or the mediaId
 * THIS NEEDS JOINS, THIS IS WRONG RIGHT NOW
 */
const getMedia = async (userId, mediaId) => {
  let queryId;
  let query = "SELECT * FROM media WHERE ";

  // return 400 if bad data, else concat query and find correct id.
  if (userId == null && mediaId == null) {
    return { success: false, status: 400, error: "No id provided." };
  } else if (userId) {
    query += "created_by_user_id = $1";
    queryId = userId;
  } else {
    query += "id = $1";
    queryId = spaceId;
  }

  try {
    const result = await pool.query(query, [queryId]);
    if (result.rows.length === 0) {
      // No results
      return { success: false, status: 404, error: "No media found." };
    } else {
      // Has results
      return { success: true, status: 200, data: result.rows };
    }
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Get media by container ID with JOIN to get container and space info
 */
const getMediaByContainer = async (containerId) => {
  const query = `
    SELECT 
      m.*,
      c.space_id,
      c.title as container_title,
      c.created_by_user_id
    FROM media m
    INNER JOIN containers c ON m.container_id = c.id
    WHERE m.container_id = $1 
      AND m.deleted = 0
    ORDER BY m.create_date_utc DESC
  `;

  try {
    const result = await pool.query(query, [containerId]);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "No media found for this container." };
    }
    return { success: true, status: 200, data: result.rows };
  } catch (error) {
    console.error("Error in getMediaByContainer:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Get media by user ID - gets all media created by a user across all spaces
 */
const getMediaByUser = async (userId) => {
  const query = `
    SELECT 
      m.*,
      c.space_id,
      c.title as container_title,
      s.title as space_title
    FROM media m
    INNER JOIN containers c ON m.container_id = c.id
    INNER JOIN space s ON c.space_id = s.id
    WHERE c.created_by_user_id = $1 
      AND m.deleted = 0
      AND c.deleted = 0
      AND s.deleted = 0
    ORDER BY m.create_date_utc DESC
  `;

  try {
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "No media found for this user." };
    }
    return { success: true, status: 200, data: result.rows };
  } catch (error) {
    console.error("Error in getMediaByUser:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Get specific media by ID
 */
const getMediaById = async (mediaId) => {
  const query = `
    SELECT 
      m.*,
      c.space_id,
      c.title as container_title,
      c.created_by_user_id,
      s.title as space_title
    FROM media m
    INNER JOIN containers c ON m.container_id = c.id
    INNER JOIN space s ON c.space_id = s.id
    WHERE m.id = $1 
      AND m.deleted = 0
  `;

  try {
    const result = await pool.query(query, [mediaId]);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "Media not found." };
    }
    return { success: true, status: 200, data: result.rows[0] };
  } catch (error) {
    console.error("Error in getMediaById:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Insert new media into database
 */
const insertMediaToDatabase = async (media) => {
  if (!media) {
    return { success: false, status: 400, error: "Media is not provided." };
  }

  const query = `
    INSERT INTO media (
      container_id, 
      filename, 
      filepath, 
      file_size, 
      video_length, 
      create_date_utc, 
      update_date_utc, 
      delete_date_utc, 
      deleted
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
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
    if (result.rows.length === 0) {
      console.error("Media did not insert:", values);
      return { success: false, status: 500, error: "Media did not insert" };
    }
    return {
      success: true,
      status: 201,
      data: result.rows[0],
      message: `Media created successfully with ID ${result.rows[0].id}`,
    };
  } catch (error) {
    console.error("Error in insertMediaToDatabase:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Update existing media
 */
const updateMedia = async (mediaId, updates) => {
  if (!mediaId) {
    return { success: false, status: 400, error: "Media ID is required." };
  }

  // Build dynamic update query based on provided fields
  const allowedFields = ['filename', 'filepath', 'file_size', 'video_length'];
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    return { success: false, status: 400, error: "No valid fields to update." };
  }

  // Add update timestamp
  updateFields.push(`update_date_utc = $${paramIndex}`);
  values.push(new Date());
  paramIndex++;

  // Add media ID for WHERE clause
  values.push(mediaId);

  const query = `
    UPDATE media 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex} 
      AND deleted = 0
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "Media not found or already deleted." };
    }
    return {
      success: true,
      status: 200,
      data: result.rows[0],
      message: "Media updated successfully",
    };
  } catch (error) {
    console.error("Error in updateMedia:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Soft delete media
 */
const deleteMedia = async (mediaId) => {
  if (!mediaId) {
    return { success: false, status: 400, error: "Media ID is required." };
  }

  const query = `
    UPDATE media 
    SET deleted = 1, 
        delete_date_utc = $1
    WHERE id = $2 
      AND deleted = 0
    RETURNING id;
  `;

  try {
    const result = await pool.query(query, [new Date(), mediaId]);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "Media not found or already deleted." };
    }
    return {
      success: true,
      status: 200,
      message: "Media deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteMedia:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

/**
 * Get media by space ID - all media in a space across all containers
 */
const getMediaBySpace = async (spaceId) => {
  const query = `
    SELECT 
      m.*,
      c.id as container_id,
      c.title as container_title,
      c.created_by_user_id
    FROM media m
    INNER JOIN containers c ON m.container_id = c.id
    WHERE c.space_id = $1 
      AND m.deleted = 0
      AND c.deleted = 0
    ORDER BY m.create_date_utc DESC
  `;

  try {
    const result = await pool.query(query, [spaceId]);
    return { 
      success: true, 
      status: 200, 
      data: result.rows,
      count: result.rows.length 
    };
  } catch (error) {
    console.error("Error in getMediaBySpace:", error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

export default {
  getMedia,
  getMediaByContainer,
  getMediaByUser,
  getMediaById,
  getMediaBySpace,
  insertMediaToDatabase,
  updateMedia,
  deleteMedia,
};
