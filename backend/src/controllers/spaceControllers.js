// getAllSpaces
// getById
// createSpace
// updateSpace
// deleteSpace
import spaceService from "../services/spaceServices.js";
import spaceModel from "../models/spaceModel.js";

const getAllSpaces = async (req, res) => {
  try {
    const userId = req.params.id;
  } catch (error) {
    return res.status(400).json({ message: "No user id provided." });
  }

  const result = await spaceService.getSpaces(userId, NULL);

  // result contains {
  //  success boolean, status int, and data any || error any
  // }
  if (!result.success) {
    return res.status(result.status).json({ message: result.error });
  } else {
    const spaces = result.data;
    return res.status(result.status).json({ spaces });
  }
};

const getById = async (req, res) => {
  try {
    const userId = req.params.id;
  } catch (error) {
    return res.status(400).json({ message: "No user id provided." });
  }

  const result = await spaceService.getSpaces(userId, NULL);
  if (!result.success) {
    return res.status(result.status).json({ message: result.error });
  } else {
    const space = result.data;
    return res.status(result.status).json({ space });
  }
};

const createSpace = async (req, res) => {
  try {
    const space = spaceModel.fromJson(req.body);
  } catch (error) {
    res.status(400).json({ message: "Invalid parameters given." });
  }
  try {
    // i cant make it acknowledge it's a space in the service
    // this is def not good practice
    spaceService.insertSpaceToDatabase(req.body);
  } catch (error) {
    return res.status(500).json({
      error: "Database Error",
      details: error.message,
    });
  }
  return res.status(200).json({ message: "Space created succesfully" });
};

export default { getAllSpaces, getById, createSpace };
