import express from "express";
const spaceRouter = express.Router();
import spaceController from "../controllers/spaceControllers.js";

// Define routes
spaceRouter.get("/users/:id", spaceController.getAllSpaces); // get spaces by the user id
spaceRouter.get("/:id", spaceController.getById); // get spaces by space
spaceRouter.post("/", spaceController.createSpace); //
spaceRouter.put("/:id", spaceController.updateSpace); // PUT /controllers/:id
spaceRouter.delete("/:id", spaceController.deleteSpace); // DELETE /controllers/:id

export default spaceRouter;
