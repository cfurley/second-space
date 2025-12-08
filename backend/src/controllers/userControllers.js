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
    logger.warn(`Login attempt with missing credentials`, {
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({ error: "Missing username or password." });
  }

  // identifier used to track attempts: prefer username, fallback to IP
  const identifier = username || req.ip || req.socket?.remoteAddress || "unknown";

  // Check server-side lockout first
  try {
    const lock = authenticationService.checkLockout(identifier);
    if (lock.locked) {
      const minutes = Math.ceil(lock.remainingMs / 60000) || 1;
      logger.warn(`Login attempt blocked due to lockout`, {
        identifier: identifier,
        remainingMinutes: minutes,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
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
        logger.warn(`Login lockout enforced after multiple failed attempts`, {
          identifier: identifier,
          attemptCount: record.attemptCount,
          timeoutMinutes: record.timeoutMinutes,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        });
        return res.status(429).json({ error: `Too many login attempts. Try again in ${record.timeoutMinutes} minute(s).` });
      }
      // Log failed attempt (warning to track potential attacks)
      logger.warn(`Failed login attempt recorded`, {
        identifier: identifier,
        attemptCount: record.attemptCount || 1,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
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
      logger.info(`Login attempt counters reset after successful authentication`, {
        identifier: identifier,
        ip: req.ip,
      });
    } catch (e) {
      // Failed to reset - log internally only, but allow successful login to proceed
      logger.error(`Failed to reset login attempt counters`, {
        identifier: identifier,
        error: e.message,
        ip: req.ip,
      });
    }

    const user = result.data;
    logger.info(`Successful login`, {
      userId: user.id,
      username: user.username,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
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
    logger.warn(`Invalid parameters for password update`, {
      error: error.message,
      ip: req.ip,
    });
    return res.status(400).json({ error: "Invalid Parameters" });
  }

  // Validate user's password
  const validation = await userService.validatePassword(password);
  if (!validation.success) {
    logger.warn(`Password validation failed during update`, {
      userId: userId,
      error: validation.error,
      ip: req.ip,
    });
    return res.status(400).json({ error: validation.error });
  }

  // Update the password
  const update = await userService.updatePassword(userId, password);
  if (!update.success) {
    logger.error(`Password update failed`, {
      userId: userId,
      status: update.status,
      error: update.error,
      ip: req.ip,
    });
    return res.status(update.status).json({ error: update.error });
  } else {
    logger.info(`Password updated successfully`, {
      userId: userId,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
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
    logger.warn(`Invalid user creation parameters`, {
      error: error.message,
      ip: req.ip,
    });
    return res.status(400).json({ error: "Invalid parameters given" });
  }

  const validFirst = await userService.validateString(
    user.first_name,
    false,
    true,
    false
  );
  if (!validFirst.success) {
    logger.warn(`Invalid first name in user creation`, {
      error: validFirst.error,
      ip: req.ip,
    });
    return res.status(400).json({ error: validFirst.error });
  }

  const validLast = await userService.validateString(
    user.last_name,
    false,
    true,
    false
  );
  if (!validLast.success) {
    logger.warn(`Invalid last name in user creation`, {
      error: validLast.error,
      ip: req.ip,
    });
    return res.status(400).json({ error: validLast.error });
  }

  const usernameValid = await userService.validateString(
    user.username,
    true,
    false,
    false
  );
  if (!usernameValid.success) {
    logger.warn(`Invalid username in user creation`, {
      error: usernameValid.error,
      ip: req.ip,
    });
    return res.status(400).json({ error: usernameValid.error });
  }

  const userCreated = await userService.createUser(user);
  if (!userCreated.success) {
    logger.error(`User creation failed`, {
      username: user.username,
      status: userCreated.status,
      error: userCreated.error,
      ip: req.ip,
    });
    return res.status(userCreated.status).json(userCreated.error);
  }

  logger.info(`New user created successfully`, {
    userId: userCreated.data.id,
    username: userCreated.data.username,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

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
