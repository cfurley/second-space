import React, { useState, useEffect } from 'react';

export function ThemeToggleButton({ embedded = false }: { embedded?: boolean }) {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setCurrentTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark mode
      setCurrentTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setCurrentTheme(theme);
    setThemeDropdownOpen(false);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const containerStyle: React.CSSProperties = embedded
    ? { position: 'relative', zIndex: 10 }
    : { position: 'fixed', left: '16px', bottom: '16px', zIndex: 50 };

  return (
    <div style={containerStyle}>
      <div className="relative">
        <button
          onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
          aria-label="Toggle theme"
          aria-expanded={themeDropdownOpen}
          className="w-12 h-12 aspect-square bg-gray-300 dark:bg-[#2C2C2C] text-gray-800 dark:text-white rounded-full border-none cursor-pointer flex items-center justify-center text-2xl shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
        >
          <span className="text-2xl" aria-hidden="true">{currentTheme === 'dark' ? '🌙' : '☀️'}</span>
        </button>

        {/* Dropdown Menu */}
        {themeDropdownOpen && (
          <div className="absolute bottom-full mb-4 left-0 bg-popover rounded-lg border border-border overflow-hidden shadow-lg min-w-[140px]" role="menu">
            <button
              onClick={() => handleThemeChange('dark')}
              role="menuitem"
              aria-label="Switch to dark theme"
              className={`w-full flex items-center gap-3 px-4 py-3 text-black dark:text-white hover:bg-card transition-all ${
                  currentTheme === 'dark' ? 'bg-card' : ''
                }`}
            >
              <span className="text-lg" aria-hidden="true">🌙</span>
              <span className="text-sm">Dark</span>
              {currentTheme === 'dark' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              role="menuitem"
              aria-label="Switch to light theme"
              className={`w-full flex items-center gap-3 px-4 py-3 text-black dark:text-white hover:bg-card transition-all ${
                  currentTheme === 'light' ? 'bg-card' : ''
                }`}
            >
              <span className="text-lg" aria-hidden="true">☀️</span>
              <span className="text-sm">Light</span>
              {currentTheme === 'light' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
