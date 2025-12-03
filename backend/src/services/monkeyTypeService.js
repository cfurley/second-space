// Note: You may need to install 'node-fetch' (npm install node-fetch)
// or ensure your Node.js version supports the native 'fetch' API globally.

const BASE_URL = "https://api.monkeytype.com/users";
const APE_KEY = process.env.MONKEYTYPE_API_KEY;

/**
 * Fetches the general typing statistics for a given user.
 * @param {string} username - The MonkeyType username or UID of the user.
 */
const getUserStats = async (username) => {
  if (!APE_KEY) {
    console.error("MONKEYTYPE_API_KEY is not set in environment variables.");
    return { success: false, status: 500, error: "API Key Missing" };
  }

  const endpoint = `${BASE_URL}/stats?uidOrName=${username}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `ApeKey ${APE_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status !== 200) {
      console.error(`MonkeyType API Error (${response.status}):`, data.message);
      return { 
        success: false, 
        status: response.status, 
        error: data.message || "Failed to fetch MonkeyType stats." 
      };
    }

    return { 
      success: true, 
      status: 200, 
      data: data.data
    };

  } catch (error) {
    console.error("Network or Fetch Error:", error.message);
    return { success: false, status: 500, error: "External API network error" };
  }
};

export default {
  getUserStats,
};