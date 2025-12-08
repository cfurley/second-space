/*
  mediaControllers.js

  Role of controller layer
  - Validate incoming HTTP-level inputs (delegates to `mediaModel.fromJson` for
    filename validation), build a server-controlled payload and call the
    service layer for DB/storage operations.

  Key responsibilities implemented here
  - Ensure `filepath` from the client is NOT passed to the service.
  - Only pass allowed fields to the service (container_id, filename, file_size,
    video_length, and optional base64 for actual file data).

  Notes / potential updates
  - For large file uploads switch to multipart/form-data and a dedicated
    middleware (e.g., `multer`) to stream the upload to disk or to cloud
    storage. Handling base64 in the controller is acceptable for small files
    or prototypes only.
  - Consider returning the created media record (or at least its id and file
    path) from `insertMediaToDatabase()` to the caller instead of a generic
    success message.
  - Consider centralizing error handling via express error middleware to
    avoid repeated try/catch blocks and to ensure consistent HTTP responses.
*/

import mediaService from "../services/mediaServices.js";
import mediaModel from "../models/mediaModel.js";
import logger from "../utils/logger.js";

const getAllMedia = async (req, res) => {
  let userId;
  try {
    userId = req.params.id;
  } catch (error) {
    logger.warn(`Failed to get all media: no user id provided`, {
      ip: req.ip,
    });
    return res.status(400).json({ message: "No user id provided." });
  }

  logger.info(`Fetching all media for user`, {
    userId: userId,
    ip: req.ip,
  });

  const result = await mediaService.getMedia(userId, null);
  if (!result.success) {
    logger.warn(`Failed to retrieve media`, {
      userId: userId,
      error: result.error,
      ip: req.ip,
    });
    return res.status(result.status).json({ error: result.error });
  } else {
    const media = result.data;
    logger.info(`Successfully retrieved media for user`, {
      userId: userId,
      mediaCount: media.length,
      ip: req.ip,
    });
    return res.status(result.status).json({ media });
  }
};

const getBySpaceId = async (req, res) => {
  let spaceId;
  try {
    spaceId = req.params.id;
  } catch (error) {
    logger.warn(`Failed to get media by space: no space id provided`, {
      ip: req.ip,
    });
    return res.status(400).json({ message: "No space id provided." });
  }

  logger.info(`Fetching media for space`, {
    spaceId: spaceId,
    ip: req.ip,
  });

  const result = await mediaService.getMediaBySpaceId(spaceId);
  if (!result.success) {
    logger.warn(`Failed to retrieve media by space id`, {
      spaceId: spaceId,
      error: result.error,
      ip: req.ip,
    });
    return res.status(result.status).json({ error: result.error });
  } else {
    const media = result.data;
    logger.info(`Successfully retrieved media for space`, {
      spaceId: spaceId,
      mediaCount: media.length,
      ip: req.ip,
    });
    return res.status(result.status).json({ media });
  }
};

const getById = async (req, res) => {
  // TODO: Make sure this is actually passed by frontend
  let mediaId;
  try {
    mediaId = req.params.id;
  } catch (error) {
    logger.warn(`Failed to get media by id: no media id provided`, {
      ip: req.ip,
    });
    return res.status(400).json({ error: "No media id provided." });
  }

  logger.info(`Fetching media by id`, {
    mediaId: mediaId,
    ip: req.ip,
  });

  const result = await mediaService.getMedia(null, mediaId);
  if (!result.success) {
    logger.warn(`Failed to retrieve media by id`, {
      mediaId: mediaId,
      error: result.error,
      ip: req.ip,
    });
    return res.status(result.status).json({ message: result.error });
  } else {
    const media = result.data;
    logger.info(`Successfully retrieved media by id`, {
      mediaId: mediaId,
      ip: req.ip,
    });
    return res.status(result.status).json({ media });
  }
};

const createMedia = async (req, res) => {
  try {
    mediaModel.fromJson(req.body);
  } catch (error) {
    // keep filename-related messages minimal
    logger.warn(`Media creation failed: invalid filename or parameters`, {
      filename: req.body.filename,
      error: error.message,
      ip: req.ip,
    });
    if (error && error.message === "Invalid filename") {
      return res.status(400).json({ error: "Invalid filename" });
    }
    return res.status(400).json({ error: "Invalid parameters" });
  }

  logger.info(`Attempting to create media`, {
    filename: req.body.filename,
    fileSize: req.body.file_size,
    containerId: req.body.container_id,
    ip: req.ip,
  });

  try {
    // Construct a server-safe payload (do not include user-provided filepath)
    const payload = {
      container_id: req.body.container_id,
      filename: req.body.filename,
      file_size: req.body.file_size,
      video_length: req.body.video_length,
      base64: req.body.base64, // optional file content
      create_date_utc: req.body.create_date_utc,
    };

    const result = await mediaService.insertMediaToDatabase(payload);
    if (!result.success) {
      logger.error(`Media creation failed`, {
        filename: req.body.filename,
        error: result.error,
        status: result.status,
        ip: req.ip,
      });
      return res.status(result.status).json({ error: result.error });
    }
    logger.info(`Media created successfully`, {
      filename: req.body.filename,
      fileSize: req.body.file_size,
      ip: req.ip,
    });
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    logger.error(`Database error during media creation`, {
      filename: req.body.filename,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({ error: "Database Error." });
  }
};

const updateMedia = async (req, res) => {
  const mediaId = req.params.id;
  
  logger.info(`Attempting to update media`, {
    mediaId: mediaId,
    filename: req.body?.filename,
    ip: req.ip,
  });

  // validate filename if provided
  if (req.body && req.body.filename) {
    try {
      mediaModel.fromJson(req.body);
    } catch (error) {
      logger.warn(`Media update failed: invalid filename`, {
        mediaId: mediaId,
        filename: req.body.filename,
        error: error.message,
        ip: req.ip,
      });
      if (error && error.message === "Invalid filename") {
        return res.status(400).json({ error: "Invalid filename" });
      }
      return res.status(400).json({ error: "Invalid parameters" });
    }
  }
  try {
    // Only allow updating specific fields
    const payload = {
      filename: req.body.filename,
      file_size: req.body.file_size,
      video_length: req.body.video_length,
    };

    const result = await mediaService.updateMediaInDatabase(mediaId, payload);
    if (!result.success) {
      logger.warn(`Media update failed`, {
        mediaId: mediaId,
        error: result.error,
        status: result.status,
        ip: req.ip,
      });
      return res.status(result.status).json({ error: result.error });
    }
    logger.info(`Media updated successfully`, {
      mediaId: mediaId,
      filename: req.body?.filename,
      ip: req.ip,
    });
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    logger.error(`Database error during media update`, {
      mediaId: mediaId,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({ error: "Database Error." });
  }
};

const deleteMedia = async (req, res) => {
  const mediaId = req.params.id;
  
  logger.info(`Attempting to delete media`, {
    mediaId: mediaId,
    ip: req.ip,
  });

  try {
    const result = await mediaService.deleteMediaFromDatabase(mediaId);
    if (!result.success) {
      logger.warn(`Media deletion failed`, {
        mediaId: mediaId,
        error: result.error,
        status: result.status,
        ip: req.ip,
      });
      return res.status(result.status).json({ message: result.error });
    }
    logger.info(`Media deleted successfully`, {
      mediaId: mediaId,
      ip: req.ip,
    });
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    logger.error(`Database error during media deletion`, {
      mediaId: mediaId,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({ error: "Server Error" });
  }
};

export default {
  getAllMedia,
  getBySpaceId,
  getById,
  createMedia,
  updateMedia,
  deleteMedia,
};
