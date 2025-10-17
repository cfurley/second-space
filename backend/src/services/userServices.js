import pool from "../db/index.js";
import userModel from "../models/userModel.js";

/**
 * Authenticates user using name and password; Not secure.
 * @param {string} username
 * @param {string} password
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

/**
 * Updates a user's password
 * @param {int} userId
 * @param {string} password
 */
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
        message: `Updated password succesfully`,
      };
    }
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, erorr: "Database Error" };
  }
};

/**
 * Creates a user from a given user object
 * @param {userModel} user
 */
const createUser = async (user) => {
  const query = `INSERT INTO user (username, password, display_name, first_name,
  last_name, full_name, create_date_utc)
  VALUES($1, $2, $3, $4, $5, $6, NOW())
  RETURNING *;`;

  const values = [
    user.username,
    user.password,
    user.username,
    user.first_name,
    user.last_name,
    user.full_name,
  ];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return { success: false, status: 400, error: "User not created" };
    }
    return { success: true, status: 200, data: result.rows };
  } catch (error) {
    return { success: false, status: 500, error: "Database error" };
  }
};

/**
 * Checks for a username's existence
 * @param {string} username
 * @returns {boolean}
 */
const usernameExists = async (username) => {
  const query = "SELECT 1 FROM user WHERE username = $1 AND deleted = $2;";
  const result = await pool.query(query, [username]);
  if (result.rows.length === 0) {
    return false;
  } else {
    return true;
  }
};

export default {
  authenticateLogin,
  updatePassword,
  createUser,
  usernameExists,
};
