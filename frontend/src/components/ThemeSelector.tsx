import React, { useState, useEffect } from "react";

export function ThemeSelector() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Load saved theme from localStorage safely
  useEffect(() => {
    try {
      const savedTheme =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("theme")
          : null;

      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      }
    } catch {
      // Fallback if localStorage is unavailable
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = html.classList.toggle("dark");

    try {
      localStorage.setItem("theme", newIsDark ? "dark" : "light");
    } catch {
      // Ignore if localStorage fails (e.g., privacy mode)
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
