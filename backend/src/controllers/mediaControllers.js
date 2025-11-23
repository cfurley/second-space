import mediaService from "../services/mediaServices.js";
import mediaModel from "../models/mediaModel.js";

const getAllMedia = async (req, res) => {
  let userId;
  try {
    userId = req.params.id;
  } catch (error) {
    return res.status(400).json({ message: "No user id provided." });
  }

  const result = await mediaService.getMedia(userId, null);
  if (!result.success) {
    return res.status(result.status).json({ message: result.error });
  } else {
    const media = result.data;
    return res.status(result.status).json({ media });
  }
};

const getById = async (req, res) => {
  let mediaId;
  try {
    mediaId = req.params.id;
  } catch (error) {
    return res.status(400).json({ message: "No media id provided." });
  }

  const result = await mediaService.getMedia(null, mediaId);
  if (!result.success) {
    return res.status(result.status).json({ message: result.error });
  } else {
    const media = result.data;
    return res.status(result.status).json({ media });
  }
};

const createMedia = async (req, res) => {
  try {
    mediaModel.fromJson(req.body);
  } catch (error) {
    // keep filename-related messages minimal
    if (error && error.message === "Invalid filename") {
      return res.status(400).json({ message: "Invalid filename" });
    }
    return res.status(400).json({ message: "Invalid parameters" });
  }

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
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Database Error.", details: error.message });
  }
};

const updateMedia = async (req, res) => {
  const mediaId = req.params.id;
  // validate filename if provided
  if (req.body && req.body.filename) {
    try {
      mediaModel.fromJson(req.body);
    } catch (error) {
      if (error && error.message === "Invalid filename") {
        return res.status(400).json({ message: "Invalid filename" });
      }
      return res.status(400).json({ message: "Invalid parameters" });
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
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", details: error.message });
  }
};

const deleteMedia = async (req, res) => {
  const mediaId = req.params.id;
  try {
    const result = await mediaService.deleteMediaFromDatabase(mediaId);
    if (!result.success) {
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", details: error.message });
  }
};

export default { getAllMedia, getById, createMedia, updateMedia, deleteMedia };
