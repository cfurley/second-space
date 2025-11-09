import express from "express";
const mediaRouter = express.Router();
import mediaController from "../controllers/mediaControllers.js";

// Get media by user ID
mediaRouter.get("/user/:userId", mediaController.getMediaByUser);

// Get media by container ID
mediaRouter.get("/container/:containerId", mediaController.getMediaByContainer);

// Get media by space ID
mediaRouter.get("/space/:spaceId", mediaController.getMediaBySpace);

// Get specific media by ID
mediaRouter.get("/:id", mediaController.getById);

// Create new media
mediaRouter.post("/", mediaController.createMedia);

// Update existing media
mediaRouter.put("/:id", mediaController.updateMedia);

// Delete media (soft delete)
mediaRouter.delete("/:id", mediaController.deleteMedia);

export default mediaRouter;
