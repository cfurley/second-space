const { pool } = require("../db/index.js")

/**
 * Gets spaced based off userId or the spaceId
 */
const getSpaces = async (userId, spaceId) => {
  let queryId;
  let query = "SELECT * FROM space WHERE ";

  // return 400 if bad data, else concat query and find correct id.
  if (userId == null && spaceId == null) {
    return { success: false, status: 400, error: "No id provided."}
  } else if (userId) {
    query += "created_by_user_id = $1"
    queryId = userId
  } else {
    query += "id = $1"
    queryId = spaceId
  }  

  try {
    const result = await pool.query(query, [id])
    if (result.rows.length === 0) { // No results
      return { success: false, status: 404, error: "No spaces found."}
    }
    else {  // Has results
      return { success: true, status: 200, data: result.rows }
    }
  }
  catch(error) {
    console.log(error)
    return { success: false, status: 500, error: 'Database Error.'}
  }
  
 
};

const insertSpaceToDatabase = async (space) => {
  let query = 
};

export default { getSpaces };

 // // returning keyword returns the rows to verify data
  // query += " RETURNING id;"
  // try {
  //   const result = pool.query(query, [id])
  //   return { success: true, status: 200, data: result.rows[0]}
  // }
  // catch(error) {
  //   console.log(error)
  //   return { success: false, status: 500, error: 'Database Error.'}
  // }