import React, { useState, useEffect } from 'react';

export function ThemeToggleButton() {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setCurrentTheme('light');
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'dark') {
      setCurrentTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      // Default to light mode if no preference saved
      setCurrentTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
      <div className="relative">
        <button
          onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-xl text-black dark:text-white cursor-pointer hover:bg-black/15 dark:hover:bg-white/15 hover:scale-110 transition-all duration-300 border border-black/30 dark:border-white/30 shadow-lg"
          style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <span className="text-2xl">{currentTheme === 'dark' ? '🌙' : '☀️'}</span>
        </button>

        {/* Dropdown Menu */}
        {themeDropdownOpen && (
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-lg border border-black/30 dark:border-white/30 overflow-hidden shadow-lg min-w-[140px]">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all ${
                currentTheme === 'dark' ? 'bg-black/10 dark:bg-white/10' : ''
              }`}
            >
              <span className="text-lg">🌙</span>
              <span className="text-sm">Dark</span>
              {currentTheme === 'dark' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all ${
                currentTheme === 'light' ? 'bg-black/10 dark:bg-white/10' : ''
              }`}
            >
              <span className="text-lg">☀️</span>
              <span className="text-sm">Light</span>
              {currentTheme === 'light' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
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
