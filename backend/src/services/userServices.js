import pool from "../db/index.js";

/**
 * Authenticates user using name and password; Not secure.
 */
const authenticateLogin = async (username, password) => {
  if (username == null || username == undefined) {
    return { success: false, status: 500, error: "Username is null." };
  }
  if (password == null || password == undefined) {
    return { success: false, status: 500, error: "Password is null." };
  }

  const query = `
   SELECT
    id,
    username,
    display_name,
    profile_picture_id,
    theme_id,
    first_name,
    last_name,
    full_name,
    timezone,
    last_login_date_utc,
    create_date_utc,
    update_date_utc
    FROM users
    WHERE deleted = $1 
    AND username = $2
    AND password = $3;
  `;
  const values = [0, username, password];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      console.log("Invalid Login");
      return { success: false, status: 400, error: "Invalid Login" };
    } else {
      return {
        success: true,
        status: 200,
        data: result.rows[0],
      };
    }
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, erorr: "Database Error" };
  }
};

const updatePassword = async (userId, password) => {
  if (userId == null || userId == undefined) {
    return { success: false, status: 500, error: "No user id provided" };
  }
  if (password == null || password == undefined) {
    return { success: false, status: 500, error: "No password provided" };
  }

  const query = `
  UPDATE user SET password = $1, update_date_utc = NOW()
  WHERE id = $2
  RETURNING id;
  `;
  const values = [password, userId];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      console.log("Update failed");
      return { success: false, status: 500, error: "Update failed" };
    } else {
      return {
        success: true,
        status: 200,
        message: `Updated user id succesfully`,
      };
    }
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, erorr: "Database Error" };
  }
};

export default { authenticateLogin, updatePassword };
