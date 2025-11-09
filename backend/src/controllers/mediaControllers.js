import mediaService from "../services/mediaServices.js";
import mediaModel from "../models/mediaModel.js";

/**
 * Get all media for a specific user
 */
const getMediaByUser = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const result = await mediaService.getMediaByUser(userId);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(result.status).json({
    media: result.data,
    count: result.data.length,
  });
};

/**
 * Get media by specific container ID
 */
const getMediaByContainer = async (req, res) => {
  const containerId = req.params.containerId;

  if (!containerId) {
    return res.status(400).json({ error: "Container ID is required." });
  }

  const result = await mediaService.getMediaByContainer(containerId);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(result.status).json({
    media: result.data,
    count: result.data.length,
  });
};

/**
 * Get media by space ID
 */
const getMediaBySpace = async (req, res) => {
  const spaceId = req.params.spaceId;

  if (!spaceId) {
    return res.status(400).json({ error: "Space ID is required." });
  }

  const result = await mediaService.getMediaBySpace(spaceId);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(result.status).json({
    media: result.data,
    count: result.count,
  });
};

/**
 * Get specific media by ID
 */
const getById = async (req, res) => {
  const mediaId = req.params.id;

  if (!mediaId) {
    return res.status(400).json({ error: "Media ID is required." });
  }

  const result = await mediaService.getMediaById(mediaId);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(result.status).json({ media: result.data });
};

/**
 * Create new media
 */
const createMedia = async (req, res) => {
  let media;

  try {
    media = mediaModel.fromJson(req.body);
  } catch (error) {
    return res.status(400).json({ error: "Invalid parameters given." });
  }

  // Validate media object
  const validation = mediaModel.validate(media);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Insert into database
  const result = await mediaService.insertMediaToDatabase(media);

  if (!result.success) {
    return res.status(result.status).json({
      error: result.error,
    });
  }

  return res.status(result.status).json({
    message: result.message,
    media: result.data,
  });
};

/**
 * Update existing media
 */
const updateMedia = async (req, res) => {
  const mediaId = req.params.id;

  if (!mediaId) {
    return res.status(400).json({ error: "Media ID is required." });
  }

  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No update data provided." });
  }

  const result = await mediaService.updateMedia(mediaId, updates);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(result.status).json({
    message: result.message,
    media: result.data,
  });
};

/**
 * Delete media (soft delete)
 */
const deleteMedia = async (req, res) => {
  const mediaId = req.params.id;

  if (!mediaId) {
    return res.status(400).json({ error: "Media ID is required." });
  }

  const result = await mediaService.deleteMedia(mediaId);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(result.status).json({
    message: result.message,
  });
};

export default {
  getMediaByUser,
  getMediaByContainer,
  getMediaBySpace,
  getById,
  createMedia,
  updateMedia,
  deleteMedia,
};
