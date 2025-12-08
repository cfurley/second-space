import spaceService from "../services/spaceServices.js";
import spaceModel from "../models/spaceModel.js";
import logger from "../utils/logger.js";

const getAllSpaces = async (req, res) => {
  let userId;
  try {
    userId = req.params.id;
  } catch (error) {
    logger.warn(`Failed to get all spaces: no user id provided`, {
      ip: req.ip,
    });
    return res.status(400).json({ message: "No user id provided." });
  }

  logger.info(`Fetching all spaces for user`, {
    userId: userId,
    ip: req.ip,
  });

  const result = await spaceService.getSpaces(userId, null);

  // result contains {
  //  success boolean, status int, and data any || error any
  // }
  if (!result.success) {
    logger.warn(`Failed to retrieve spaces`, {
      userId: userId,
      error: result.error,
      ip: req.ip,
    });
    return res.status(result.status).json({ message: result.error });
  } else {
    const spaces = result.data;
    logger.info(`Successfully retrieved spaces for user`, {
      userId: userId,
      spaceCount: spaces.length,
      ip: req.ip,
    });
    return res.status(result.status).json({ spaces });
  }
};

// Hello
const getById = async (req, res) => {
  let spaceId;
  try {
    spaceId = req.params.id;
  } catch (error) {
    logger.warn(`Failed to get space by id: no space id provided`, {
      ip: req.ip,
    });
    return res.status(400).json({ message: "No space id provided." });
  }

  logger.info(`Fetching space by id`, {
    spaceId: spaceId,
    ip: req.ip,
  });

  const result = await spaceService.getSpaces(null, spaceId);
  if (!result.success) {
    logger.warn(`Failed to retrieve space by id`, {
      spaceId: spaceId,
      error: result.error,
      ip: req.ip,
    });
    return res.status(result.status).json({ message: result.error });
  } else {
    const space = result.data;
    logger.info(`Successfully retrieved space by id`, {
      spaceId: spaceId,
      ip: req.ip,
    });
    return res.status(result.status).json({ space });
  }
};

const createSpace = async (req, res) => {
  try {
    const space = spaceModel.fromJson(req.body); // TODO: this is only local, fix
  } catch (error) {
    logger.warn(`Space creation failed: invalid parameters`, {
      error: error.message,
      ip: req.ip,
    });
    res.status(400).json({ error: "Invalid parameters given." });
  }

  logger.info(`Attempting to create space`, {
    ip: req.ip,
  });

  try {
    // i cant make it acknowledge it's a space in the service
    // this is def not good practice
    await spaceService.insertSpaceToDatabase(req.body);
    logger.info(`Space created successfully`, {
      spaceName: req.body.name,
      ip: req.ip,
    });
  } catch (error) {
    logger.error(`Space creation failed: database error`, {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({
      error: "Database Error.",
      details: error.message,
    });
  }
  return res.status(200).json({ message: "Space created succesfully" });
};

const updateSpace = async (req, res) => {
  return res.status(500).json({ message: "Route not implemented yet" });
};

const deleteSpace = async (req, res) => {
  return res.status(500).json({ message: "Route not implemented yet" });
};

export default { getAllSpaces, getById, createSpace, updateSpace, deleteSpace };
