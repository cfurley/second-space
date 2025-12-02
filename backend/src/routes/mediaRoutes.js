import express from "express";
const mediaRouter = express.Router();
import mediaController from "../controllers/mediaControllers.js";

// Define routes
mediaRouter.get("/users/:id", mediaController.getAllMedia); // get media by the user id
mediaRouter.get("/:id", mediaController.getById); // get media by id
mediaRouter.post("/", mediaController.createMedia);
mediaRouter.put("/:id", mediaController.updateMedia); // PUT /media/:id
mediaRouter.delete("/:id", mediaController.deleteMedia); // DELETE /media/:id

export default mediaRouter;
