import React, { useState, useEffect } from "react";

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
