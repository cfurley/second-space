import express from "express";
const themeRouter = express.Router();
import themeController from "../controllers/themeControllers.js";

// Theme Routes (Part A)
// GET the currently selected theme for the authenticated user
themeRouter.get("/theme", themeController.getUserTheme);
// PUT to set a new theme for the authenticated user
themeRouter.put("/theme", themeController.updateUserTheme);

// MonkeyType Route (Part B)
// GET MonkeyType stats (requires 'username' query param for now)
themeRouter.get("/monkeytype/stats", themeController.getMonkeyTypeStats);

export default themeRouter;