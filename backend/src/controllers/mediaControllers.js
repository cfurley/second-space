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
    const result = await mediaService.insertMediaToDatabase(req.body);
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
    const result = await mediaService.updateMediaInDatabase(mediaId, req.body);
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
