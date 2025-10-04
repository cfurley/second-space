import pool from "../db/index.js";

/**
 * Gets spaced based off userId or the spaceId
 */
const getSpaces = async (userId, spaceId) => {
  let queryId;
  let query = "SELECT * FROM space WHERE ";

  // return 400 if bad data, else concat query and find correct id.
  if (userId == null && spaceId == null) {
    return { success: false, status: 400, error: "No id provided." };
  } else if (userId) {
    query += "created_by_user_id = $1";
    queryId = userId;
  } else {
    query += "id = $1";
    queryId = spaceId;
  }

  try {
    const result = await pool.query(query, [queryId]);
    if (result.rows.length === 0) {
      // No results
      return { success: false, status: 404, error: "No spaces found." };
    } else {
      // Has results
      return { success: true, status: 200, data: result.rows };
    }
  } catch (error) {
    console.log(error.stack);
    return { success: false, status: 500, error: "Database Error." };
  }
};

const insertSpaceToDatabase = async (space) => {
  if (space === null || space === undefined) {
    return { success: false, status: 400, error: "Space is not given." };
  }

  const query = `
    INSERT INTO space (created_by_user_id, title, icon,
    create_date_utc, update_date_utc, delete_date_utc, deleted)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `;

  const values = [
    space.created_by_user_id,
    space.title,
    space.icon ?? null,
    space.create_date_utc ? new Date(space.create_date_utc) : new Date(),
    null,
    null,
    0
  ];
  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      console.log("Space did not insert:", values);
      return { success: false, status: 500, error: "Space did not insert" };
    } else {
      return {
        success: true,
        status: 200,
        message: `Created space ${result.rows[0].id} succesfully`,
      };
    }
  } catch (error) {
    console.log(error);
    return { success: false, status: 500, error: "Server Error" };
  }
};

export default { getSpaces, insertSpaceToDatabase };
