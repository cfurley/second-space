// Reference the space and user services for an idea on stylization and how to set up the service.
import themeModel from "../models/themeModel.js";   // Might not be needed
import pool from "../db/index.js";


// THIS WILL NOT WORK AND WILL NEED TO BE MODIFIED. THIS IS ONLY A LOOSE EXAMPLE.
getAllThemes = async () => {
    try {
        const res = await pool.query("SELECT * FROM themes");
        const themes = res.rows;
        return { success: true, status: 200, data: themes };
    }   catch (error) {
        return { success: false, status: 500, error: error.message };
    }
}

getThemeById = async (themeId) => {
    try { 
        const res = await pool.query("SELECT * FROM themes WHERE id = $1", [themeId]);
        const theme = res.rows[0];
        if (!theme) {
            return { success: false, status: 404, error: "Theme not found" };
        }
        return { success: true, status: 200, data: theme };
    } catch (error) {
        return { success: false, status: 500, error: error.message };
    }
}

export default { getAllThemes, getThemeById };