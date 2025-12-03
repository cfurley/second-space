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
  const isClient = typeof document !== "undefined";

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (!isClient) return false;
    return document.documentElement.classList.contains("dark");
  });

  // Load saved theme from localStorage safely on mount
  useEffect(() => {
    if (!isClient) return;
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      }
    } catch {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // 1. Load theme from backend first, fall back to localStorage/default
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        // Fetch the theme ID the user saved last
        const response = await fetch(`${API_BASE_URL}/theme/theme`, {
          method: "GET",
          headers: {
            // IMPORTANT: Include your authentication token here
            // "Authorization": `Bearer ${userToken}`,
          },
        });
        // TODO: Handle the response and set theme accordingly
      } catch {
        // Handle error silently
      }
    };
    fetchUserTheme();
  }, [isClient]);

  const toggleTheme = () => {
    if (!isClient) return;
    const html = document.documentElement;
    const newIsDark = html.classList.toggle("dark");
    try {
      localStorage.setItem("theme", newIsDark ? "dark" : "light");
    } catch {
      // ignore
    }
    setIsDark(newIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light" : "Switch to dark"}
      className="fixed left-6 bottom-6 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all duration-200 shadow-md"
    >
      <span className="text-lg select-none">{isDark ? "🌞" : "🌙"}</span>
    </button>
  );
}
