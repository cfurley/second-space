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

  // Validate user's password
  const validation = await validatePassword(password);
  if (!validation.success) {
    return res.status(400).json({ message: validation.error });
  }

  // Update the password
  const update = await userService.updatePassword(userId, password);
  if (!update.success) {
    return res.status(update.status).json({ error: update.error });
  } else {
    return res.status(update.status).json({ message: update.message });
  }
};

const createUser = async (req, res) => {
  //   return res.status(500).json({ message: "Route not implemented yet" });
  let user;
  try {
    user = userModel.fromJson(req.body);
  } catch (error) {
    return res.status(400).json({ error: "Invalid parameters given" });
  }

  const validFirst = validateString(user.first_name, false, true, false);
  if (!validFirst.success) {
    return res.status(400).json({ error: validFirst.error });
  }

  const validLast = validateString(user.last_name, false, true, false);
  if (!validLast.success) {
    return res.status(400).json({ error: validLast.error });
  }

  const usernameValid = validateString(user.username, true, false, false);
  if (!usernameValid.success) {
    return res.status(400).json({ error: usernameValid.error });
  }

  const userCreated = await userService.createUser(user);
  if (!userCreated.success) {
    return res.status(userCreated.status).json(userCreated.error);
  }

  return res.status(userCreated.status).json(userCreated.data);
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

/**
 * Validate username
 * @param {string} str
 * @param {boolean} username
 * @param {boolean} name
 * @param {boolean} displayName
 */
validateString = async (
  str,
  username = false,
  name = false,
  displayName = false
) => {
  let field;
  if (username) field = "username";
  else if (name) field = "name";
  else if (field) field = "displayName";
  else {
    return { success: false, error: "Internal Error: No boolean specified" };
  }

  // type check
  if (typeof str !== "string") {
    return { success: false, error: `${field} is not a string` };
  }

  // Length requirement
  if (!name && (str.length < 6 || str.length > 16)) {
    return {
      success: false,
      error: `${field} must be between six and 16 characters`,
    };
  }

  // Maybe add a profanity-checking library

  // Must not have whitespace
  if (/\s/.test(str)) {
    return { success: false, error: `${field} contains spaces` };
  }

  // Check character types
  const pattern = /^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]*$/;
  hasValidCharacters = pattern.test(str);
  if (!hasValidCharacters) {
    return { success: false, error: `${field} contains invalid characters` };
  }

  // Unique check
  if (username && userService.usernameExists(str)) {
    return { success: false, error: "Username is already taken" };
  }

  return { success: true, message: "Valid" };
};

export default {
  authenticate,
  updatePassword,
  createUser,
  updateUser,
  deleteUser,
};
