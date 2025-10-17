// import mediaService from "../services/mediaServices.js";
// import mediaModel from "../models/mediaModel.js";

// const getAllMedia = async (req, res) => {
//   let userId;
//   try {
//     userId = req.params.id;
//   } catch (error) {
//     return res.status(400).json({ message: "No media id provided." });
//   }

//   const result = await mediaService.getMedia(userId, null);

//   // result contains {
//   //  success boolean, status int, and data any || error any
//   // }
//   if (!result.success) {
//     return res.status(result.status).json({ message: result.error });
//   } else {
//     const spaces = result.data;
//     return res.status(result.status).json({ spaces });
//   }
// };

// // Hello
// const getById = async (req, res) => {
//   let mediaId;
//   try {
//     mediaId = req.params.id;
//   } catch (error) {
//     return res.status(400).json({ message: "No media id provided." });
//   }

//   const result = await spaceService.getMedia(null, mediaId);
//   if (!result.success) {
//     return res.status(result.status).json({ message: result.error });
//   } else {
//     const media = result.data;
//     return res.status(result.status).json({ media });
//   }
// };

// const createMedia = async (req, res) => {
//   try {
//     const media = mediaModel.fromJson(req.body);
//   } catch (error) {
//     res.status(400).json({ error: "Invalid parameters given." });
//   }
//   try {
//     // i cant make it acknowledge it's a media object in the service
//     // this is def not good practice
//     mediaService.insertMediaToDatabase(req.body);
//   } catch (error) {
//     return res.status(500).json({
//       error: "Database Error.",
//       details: error.message,
//     });
//   }
//   return res.status(200).json({ message: "Media created succesfully" });
// };

// const updateMedia = async (req, res) => {
//   return res.status(500).json({ message: "Route not implemented yet" });
// };

// const deleteMedia = async (req, res) => {
//   return res.status(500).json({ message: "Route not implemented yet" });
// };

// export default { getAllMedia, getById, createMedia, updateMedia, deleteMedia };
