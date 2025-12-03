import React, { useState, useEffect } from "react";

// NOTE: Replace this with your actual backend API URL
// In a real application, you should import this from a central utility file (like 'frontend/src/utils/api.ts').
const API_BASE_URL = "http://localhost:8080"; 

// --- NOTE ON THEME IDs ---
// We will use 1 for Dark and 2 for Light/Default.
// You must ensure these IDs match your theme table in your PostgreSQL database.
const DARK_THEME_ID = 1;
const LIGHT_THEME_ID = 2; // Or use null if 0/null is your default

export function ThemeSelector() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  
  // Utility function to call the backend
  const updateBackendTheme = async (themeId: number | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/themes/theme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // IMPORTANT: Add Authorization header here if your route requires it
          // "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({ themeId }),
      });

      if (!response.ok) {
        // Handle failure (e.g., theme ID doesn't exist, auth failed)
        console.error("Failed to save theme preference to server.");
        // Optionally show a toast notification here
      }
    } catch (error) {
      console.error("Network error saving theme:", error);
    }
  };

  // 1. Load theme from backend first, fall back to localStorage/default
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        // Fetch the theme ID the user saved last
        const response = await fetch(`${API_BASE_URL}/themes/theme`, {
          method: "GET",
          headers: {
            // IMPORTANT: Include your authentication token here
            // "Authorization": `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const themeId = data.theme_id;

          const newIsDark = themeId === DARK_THEME_ID;
          setIsDark(newIsDark);
          
          if (newIsDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          
          // Update local storage as a quick cache
          localStorage.setItem("theme", newIsDark ? "dark" : "light");
        } else {
          // Fallback if backend theme data retrieval fails
          const savedTheme = localStorage.getItem("theme");
          if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user theme, falling back to local:", error);
        // Fallback to local storage theme if API call fails entirely
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
          setIsDark(true);
        }
      }
    };

    fetchUserTheme();
  }, []); // Run only once on mount

  // 2. Toggle and save theme to backend
  const toggleTheme = () => {
    const html = document.documentElement;
    
    // Determine the new state
    const isCurrentlyDark = html.classList.contains("dark");
    const newIsDark = !isCurrentlyDark;
    
    // Apply theme locally first for instant feedback
    if (newIsDark) {
        html.classList.add("dark");
    } else {
        html.classList.remove("dark");
    }
    
    // Determine the theme ID to send to the backend
    const newThemeId = newIsDark ? DARK_THEME_ID : LIGHT_THEME_ID;

    // Send the new state to the backend
    updateBackendTheme(newThemeId);
    
    // Update local storage and component state (used for the button text)
    try {
      localStorage.setItem("theme", newIsDark ? "dark" : "light");
    } catch {
      // Ignore if localStorage fails
    }

    setIsDark(newIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg py-2.5 transition-all duration-300"
    >
      <span className="text-lg">{isDark ? "🌞" : "🌙"}</span>
      <span className="text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
