/**
 * Explain function here..
 */
const getSpaces = async (userID, spaceID) => {
  // get database connection from the pool
  let query = "SELECT * FROM space WHERE ";
  if (userId == NULL && spaceId) {
    // return a 500 error for internal error
  } else if (userId.HasValue) {
    query = query + "created_by_user_id = " + userId;
  } else {
    query = query + "id = " + spaceId;
  }
  // postgres function to execute on the database
  let result = databaseResult;
  return result;
};

const insertSpaceToDatabase = async (space) => {
  let query = "";
};

export default { getSpaces };
