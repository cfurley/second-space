import express from "express";
const themeRouter = express.Router();
import themeController from "../controllers/themeControllers.js";

// There isn't actually logic for user-created themes in the database yet. You can add it though! :)
// You should only need to update the theme table to have a "user_id" foreign key column to link themes to users.
// Then update the models > themeModel.js to include the attribute and create more controllers.

// Define routes
themeRouter.get("/", themeController.getAllThemes); // Get all themes
themeRouter.get("/:id", themeController.getThemeById); // Get theme by ID

// The theme id for a specific user is returned by the user controller when fetching user details.
// You will then call the getThemeById route with that id to get the theme details.

export default themeRouter;