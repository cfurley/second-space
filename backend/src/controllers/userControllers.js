import userService from "../services/userServices.js";
import userModel from "../models/userModel.js";

const authenticate = async (req, res) => {
  let username;
  let password;
  try {
    username = req.params.username;
    password = req.params.password;
  } catch (error) {
    return res.status(400).json({ message: "Missing parameters." });
  }

  const result = await userService.authenticateLogin(username, password);

  if (!result.success) {
    return res.status(result.status).json({ message: result.error });
  } else {
    const user = result.data;
    return res.status(result.status).json({ user });
  }
};

const updatePassword = async (req, res) => {
  let userId;
  let password;
  try {
    userId = req.params.userId;
    password = req.params.password;
  } catch (error) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  const validation = validatePassword(password);
  if (!validation.success) {
    return res.status(400).json({ message: validation.error });
  }
};

const createUser = async (req, res) => {
  return res.status(500).json({ message: "Route not implemented yet" });
};

const updateUser = async (req, res) => {
  return res.status(500).json({ message: "Route not implemented yet" });
};

const deleteUser = async (req, res) => {
  return res.status(500).json({ message: "Route not implemented yet" });
};

/**
 * Validate the user password
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
  if (password.length <= 20) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNonAlpha = /[^A-Za-z]/.test(password);

    if (!hasUpper) {
      return { success: false, error: "Must have a upper case letter" };
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
  authenticate,
  updatePassword,
  createUser,
  updateUser,
  deleteUser,
};
