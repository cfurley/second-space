import React, { useState, useEffect } from "react";
import { api, Theme } from "../utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Loader2, Palette } from "lucide-react"; // Assuming lucide-react is installed with shadcn

export function ThemeSelector() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to apply theme colors to CSS variables
  const applyTheme = (theme: any) => {
    const root = document.documentElement;

    // Helper to set property if value exists
    const setVar = (name: string, value: string) => {
      if (value) root.style.setProperty(name, value);
    };

    // Handle both camelCase (frontend type) and snake_case (backend raw)
    const bg = theme.backgroundColor || theme.background_color;
    const text = theme.textColor || theme.text_color;
    const main = theme.mainColor || theme.main_color;
    const sub = theme.subColor || theme.sub_color;
    const error = theme.errorColor || theme.error_color;

    // 1. Set Main Application Colors
    setVar("--background", bg);
    setVar("--foreground", text);
    setVar("--primary", main);
    setVar("--primary-foreground", bg); // Usually inverse of primary
    setVar("--secondary", sub);
    setVar("--secondary-foreground", text);
    setVar("--destructive", error);
    
    // 2. Set UI Component Colors (Card, Popover, etc.) to match background by default
    setVar("--card", bg);
    setVar("--card-foreground", text);
    setVar("--popover", bg);
    setVar("--popover-foreground", text);
    setVar("--muted", sub);
    setVar("--muted-foreground", text); // Adjust opacity in CSS if needed or derive color

    // 3. Handle specific "Dark Mode" class for Tailwind utilities
    // If the theme name contains "dark", we add the class, otherwise remove it
    if (theme.name && theme.name.toLowerCase().includes("dark")) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to local storage
    localStorage.setItem("themeId", theme.id);
    setCurrentThemeId(theme.id);
  };

  // Fetch themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      setLoading(true);
      try {
        const data = await api.getThemes();
        // The API might return an array directly or an object { data: [...] }
        const themeList = Array.isArray(data) ? data : data.data || [];
        setThemes(themeList);

        // Try to load saved theme
        const savedId = localStorage.getItem("themeId");
        if (savedId) {
          const savedTheme = themeList.find((t: any) => t.id === savedId || t.id == savedId);
          if (savedTheme) {
            applyTheme(savedTheme);
          }
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const handleThemeSelect = (theme: Theme) => {
    applyTheme(theme);
  };

  return (
    <div className="fixed left-6 bottom-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm shadow-md border-border hover:bg-accent transition-all duration-300"
            aria-label="Select Theme"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="text-xl">🎨</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-48 mb-2">
          {themes.length === 0 ? (
            <DropdownMenuItem disabled>
              No themes found
            </DropdownMenuItem>
          ) : (
            themes.map((theme: any) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {/* Color preview dot */}
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" 
                  style={{ backgroundColor: theme.mainColor || theme.main_color }}
                />
                <span className={currentThemeId === theme.id ? "font-bold" : ""}>
                  {theme.name}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
