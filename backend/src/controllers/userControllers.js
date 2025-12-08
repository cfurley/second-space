import userService from "../services/userServices.js";
import authenticationService from "../services/authenticationServices.js";
import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";

/**
 * Authenticate a user login
 */
const authenticate = async (req, res) => {
  const { username, password } = req.body;

  // Validate input first - no point in recording attempts for null username
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password." });
  }

  // identifier used to track attempts: prefer username, fallback to IP
  const identifier = username || req.ip || req.socket?.remoteAddress || "unknown";

  // Check server-side lockout first
  try {
    const lock = authenticationService.checkLockout(identifier);
    if (lock.locked) {
      const minutes = Math.ceil(lock.remainingMs / 60000) || 1;
      return res.status(429).json({ error: `Too many login attempts. Try again in ${minutes} minute(s).` });
    }
  } catch (e) {
    // Lockout system failure - fail securely by blocking authentication
    logger.error(`Lockout system check failed`, {
      identifier: identifier,
      error: e.message,
      ip: req.ip,
    });
    return res.status(500).json({ error: "Authentication system error. Please try again later." });
  }

  const result = await userService.authenticateLogin(username, password);

  if (!result.success) {
    // record failed attempt and possibly enforce lockout
    try {
      const record = authenticationService.recordFailedAttempt(identifier);
      if (record.shouldLock) {
        return res.status(429).json({ error: `Too many login attempts. Try again in ${record.timeoutMinutes} minute(s).` });
      }
      // If warning, still return same Invalid Login error to avoid revealing info
    } catch (e) {
      // Failed to record attempt - log internally only
      logger.error(`Failed to record login attempt`, {
        identifier: identifier,
        error: e.message,
        ip: req.ip,
      });
      return res.status(500).json({ error: "Authentication system error." });
    }
    return res.status(result.status).json({ error: result.error });
  } else {
    // Successful login: reset any counters for this identifier
    try {
      authenticationService.resetAttempts(identifier);
    } catch (e) {
      // Failed to reset - log internally only, but allow successful login to proceed
      logger.error(`Failed to reset login attempt counters`, {
        identifier: identifier,
        error: e.message,
        ip: req.ip,
      });
    }

    const user = result.data;
    // Set cache headers to cache the user data in the browser
    res.set({
      "Cache-Control": "private, max-age=3600", // Cache for 1 hour
      "Content-Type": "application/json",
    });
    return res.status(result.status).json(user);
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
    return res.status(400).json({ error: "Invalid Parameters" });
  }

  // Validate user's password
  const validation = await userService.validatePassword(password);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
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

  const validFirst = await userService.validateString(
    user.first_name,
    false,
    true,
    false
  );
  if (!validFirst.success) {
    return res.status(400).json({ error: validFirst.error });
  }

  const validLast = await userService.validateString(
    user.last_name,
    false,
    true,
    false
  );
  if (!validLast.success) {
    return res.status(400).json({ error: validLast.error });
  }

  const usernameValid = await userService.validateString(
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

  // Set cache headers to cache the user data in the browser
  res.set({
    "Cache-Control": "private, max-age=3600", // Cache for 1 hour
    "Content-Type": "application/json",
  });
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
