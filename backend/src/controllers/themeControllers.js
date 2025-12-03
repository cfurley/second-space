import themeService from "../services/themeServices.js";
import monkeyTypeService from "../services/monkeyTypeService.js";

/**
 * Get the currently selected theme for the authenticated user
 */
const getUserTheme = async (req, res) => {
  // NOTE: REPLACE '1' with actual authenticated user ID (e.g., req.userId)
  const userId = req.userId || 1; 

  const result = await themeService.getUserThemeId(userId);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  } else {
    // The response will contain { theme_id: 1 } or { theme_id: null }
    return res.status(result.status).json(result.data);
  }
};

/**
 * Update the theme for an authenticated user
 */
const updateUserTheme = async (req, res) => {
  // NOTE: REPLACE '1' with actual authenticated user ID (e.g., req.userId)
  const userId = req.userId || 1; 

  const { themeId } = req.body;

  if (themeId === undefined) {
    return res.status(400).json({ error: "Missing 'themeId' in request body." });
  }

  // Handle null/undefined/numeric themeId
  let newThemeId = themeId === null ? null : parseInt(themeId);
  if (newThemeId !== null && isNaN(newThemeId)) {
    return res.status(400).json({ error: "Invalid 'themeId' format." });
  }

  const update = await themeService.updateUserThemeId(userId, newThemeId);

  if (!update.success) {
    return res.status(update.status).json({ error: update.error });
  } else {
    return res.status(update.status).json({ message: update.message });
  }
};

/**
 * Fetches MonkeyType stats for a specified user.
 */
const getMonkeyTypeStats = async (req, res) => {
  // Assuming the user's MonkeyType username is passed in the query.
  const { username } = req.query; 

  if (!username) {
    return res.status(400).json({ error: "Missing 'username' query parameter." });
  }

  const result = await monkeyTypeService.getUserStats(username);

  if (!result.success) {
    return res.status(result.status).json({ error: result.error });
  } else {
    // Return the stats fetched from the external API
    return res.status(result.status).json(result.data);
  }
};

export default {
  getUserTheme,
  updateUserTheme,
  getMonkeyTypeStats,
};
