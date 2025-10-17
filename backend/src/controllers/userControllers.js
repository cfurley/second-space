import userService from "../services/userServices.js";
import userModel from "../models/userModel.js";

/**
 * Authenticate a user login
 */
const authenticate = async (req, res) => {
  const username = req.params.username;
  const password = req.params.password;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password." });
  }

  const result = await userService.authenticateLogin(username, password);

  if (!result.success) {
    return res.status(result.status).json({ message: result.error });
  } else {
    const user = result.data;
    return res.status(result.status).json({ user });
  }
};

/**
 * Update password for a user
 */
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
  const validation = await userService.validatePassword(password);
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

/**
 * Create a user from json
 */
const createUser = async (req, res) => {
  let user;
  try {
    user = userModel.fromJson(req.body);
  } catch (error) {
    return res.status(400).json({ error: "Invalid parameters given" });
  }

  const validFirst = userService.validateString(
    user.first_name,
    false,
    true,
    false
  );
  if (!validFirst.success) {
    return res.status(400).json({ error: validFirst.error });
  }

  const validLast = userService.validateString(
    user.last_name,
    false,
    true,
    false
  );
  if (!validLast.success) {
    return res.status(400).json({ error: validLast.error });
  }

  const usernameValid = userService.validateString(
    user.username,
    true,
    false,
    false
  );
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

export default {
  authenticate,
  updatePassword,
  createUser,
  updateUser,
  deleteUser,
};
