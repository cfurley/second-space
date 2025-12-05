// Reference the space and user controllers for an idea on stylization and how to set up the controller.
import themeService from "../services/themeServices.js";
import themeModel from "../models/themeModel.js";

// THE BELOW IS ONLY LOOSE EXAMPLE CODE AND WILL NOT WORK

// Get all themes
const getAllThemes = async (req, res) => {
  const result = await themeService.getAllThemes();
    // result contains {
    //  success boolean, status int, and data any || error any
    // }
    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    } else {
      const themes = result.data;
      return res.status(result.status).json({ themes });
    }
};

// Get theme by ID
const getThemeById = async (req, res) => {
    let themeId;
    try {
      themeId = req.params.id;
    } catch (error) {
      return res.status(400).json({ message: "No theme id provided." });
    }
    const result = await themeService.getThemeById(themeId);
    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    } else {
      const theme = result.data;
      return res.status(result.status).json({ theme });
    }
}

export default { getAllThemes, getThemeById };