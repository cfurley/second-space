import pool from "../db/index.js";

/**
 * Retrieves a user's current theme ID from the database.
 * @param {number} userId - The ID of the user.
 */
const getUserThemeId = async (userId) => {
  if (userId == null) {
    return { success: false, status: 400, error: "No user id provided." };
  }

  const query = `
    SELECT theme_id
    FROM "user"
    WHERE id = $1 AND deleted = 0;
  `;
  try {
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "User not found." };
    }
    // theme_id can be null if no theme is set
    return {
      success: true,
      status: 200,
      data: { theme_id: result.rows[0].theme_id },
    };
  } catch (error) {
    console.error(error.stack);
    return { success: false, status: 500, error: "Database Error" };
  }
};

/**
 * Updates a user's theme ID in the database.
 * @param {number} userId - The ID of the user.
 * @param {number | null} themeId - The ID of the new theme to set (or null to reset).
 */
const updateUserThemeId = async (userId, themeId) => {
  if (userId == null) {
    return { success: false, status: 400, error: "No user id provided." };
  }
  
  const query = `
    UPDATE "user" SET theme_id = $1, update_date_utc = NOW()
    WHERE id = $2
    RETURNING id;
  `;
  const values = [themeId, userId];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return { success: false, status: 404, error: "User not found or update failed." };
    }
    return {
      success: true,
      status: 200,
      message: `Theme updated successfully to ID: ${themeId}`,
    };
  } catch (error) {
    console.error(error.stack);
    return { success: false, status: 500, error: "Database Error" };
  }
};

export default {
  getUserThemeId,
  updateUserThemeId,
};
