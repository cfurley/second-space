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
    FROM "user"
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
  UPDATE "user" SET password = $1, update_date_utc = NOW()
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
  const query = `INSERT INTO "user" (username, password, display_name, first_name,
  last_name, create_date_utc, last_login_date_utc)
  VALUES($1, $2, $3, $4, $5, NOW(), NOW())
  RETURNING *;`;

  const values = [
    user.username,
    user.password,
    user.username,
    user.first_name,
    user.last_name,
  ];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return { success: false, status: 400, error: "User not created" };
    }
    return { success: true, status: 200, data: result.rows };
  } catch (error) {
    console.error("Database error creating user:", error);
    return { success: false, status: 500, error: "Database error" };
  }
};

/**
 * Checks for a username's existence
 * @param {string} username
 * @returns {boolean}
 */
const usernameExists = async (username) => {
  const query = `SELECT 1 FROM "user" WHERE username = $1 AND deleted = $2;`;
  const result = await pool.query(query, [username, 0]);
  if (result.rows.length === 0) {
    return false;
  } else {
    return true;
  }
};

/**
 * Validate username
 * @param {string} str
 * @param {boolean} username
 * @param {boolean} name
 * @param {boolean} displayName
 */
const validateString = async (
  str,
  username = false,
  name = false,
  displayName = false
) => {
  let field;
  if (username) field = "username";
  else if (name) field = "name";
  else if (displayName) field = "displayName";
  else {
    return { success: false, error: "Internal Error: No boolean specified" };
  }

  // type check
  if (typeof str !== "string") {
    return { success: false, error: `${field} is not a string` };
  }

  // Trim for validation purposes
  const trimmed = str.trim();

  // Must not be empty
  if (trimmed.length === 0) {
    return { success: false, error: `${field} cannot be empty` };
  }

  // Length requirements
  if (username) {
    // Username: must be less than 16 characters
    if (str.length >= 16) {
      return {
        success: false,
        error: `${field} must be less than 16 characters`,
      };
    }
  } else if (name) {
    // Names: reasonable length limit (e.g., 1-50 characters)
    if (trimmed.length > 50) {
      return {
        success: false,
        error: `${field} must be less than 50 characters`,
      };
    }
  } else {
    // Display name: 6-16 characters
    if (str.length < 6 || str.length > 16) {
      return {
        success: false,
        error: `${field} must be between 6 and 16 characters`,
      };
    }
  }

  // Whitespace validation
  if (username) {
    // Usernames: no whitespace allowed at all
    if (/\s/.test(str)) {
      return { success: false, error: `${field} cannot contain spaces` };
    }
  }
  // Names can contain spaces, so we don't check for them

  // Character validation
  if (username) {
    // Username: only letters, digits, underscores, hyphens
    const usernamePattern = /^[A-Za-z0-9_-]+$/;
    if (!usernamePattern.test(str)) {
      return {
        success: false,
        error: `${field} can only contain letters, numbers, underscores, and hyphens`,
      };
    }
  } else if (name) {
    // Names: only letters and spaces
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmed)) {
      return {
        success: false,
        error: `${field} can only contain letters and spaces`,
      };
    }
  } else {
    // Display name: broader character set
    const pattern = /^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]*$/;
    if (!pattern.test(str)) {
      return { success: false, error: `${field} contains invalid characters` };
    }
  }

  // Unique check for usernames
  if (username && (await usernameExists(str))) {
    return { success: false, error: "Username is already taken" };
  }

  return { success: true, message: "Valid" };
};

/**
 * Validate the user password
 * @param {string} password
 */
const validatePassword = async (password) => {
  // Must be a string
  if (typeof password !== "string") {
    return { success: false, error: "Password is not a string" };
  }

  // Must not have spaces
  if (password.includes(" ")) {
    return { success: false, error: "Password contains space(s)" };
  }

  // Must be between 8 and 64 characters long
  if (password.length < 8 || password.length > 64) {
    return {
      success: false,
      error: "Password length must be between 8 and 64 characters",
    };
  }

  const pattern = /^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]*$/;

  // Check character types
  hasValidCharacters = pattern.test(password);
  if (!hasValidCharacters) {
    return { success: false, error: "Password contains invalid characters" };
  }

  // Check strength requirements
  if (password.length <= 65) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNonAlpha = /[^A-Za-z]/.test(password);

    if (!hasUpper) {
      return { success: false, error: "Must have an upper case letter" };
    } else if (!hasLower) {
      return { success: false, error: "Must have a lower case letter" };
    } else if (!hasNonAlpha) {
      return {
        success: false,
        error: "Must have a non-alphabetical character",
      };
    }
  }

  // If it is strong then return true
  return { success: true };
};

export default {
  authenticateLogin,
  updatePassword,
  createUser,
  usernameExists,
  validateString,
  validatePassword,
};
