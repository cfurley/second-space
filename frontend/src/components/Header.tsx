import React from 'react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function Header({ activeNav, onNavChange, searchQuery, onSearchChange }: HeaderProps & { searchQuery?: string; onSearchChange?: (query: string) => void }) {
  const navItems = ['Spaces', 'Recent', 'Shared'];
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  // Mock auth state - in a real app, this would come from an auth context/provider
  const isLoggedIn = false; // Change to true to test logged-in state

  return (
    <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Second Space branding */}
        <div className="flex items-center">
          <h1 className="text-gray-900 dark:text-white font-semibold" style={{ fontSize: '0.5in' }}>Second Space</h1>
        </div>
        
        {/* Right: Search bar with AI button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-[280px] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-4 py-1.5 pr-10 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 transition-all"
            />
            <svg 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          
          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 flex items-center justify-center text-gray-700 dark:text-white font-semibold transition-all border border-gray-300 dark:border-white/20"
            >
              AT
            </button>
            
            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-white font-medium border-b border-gray-200 dark:border-white/10">
                    Username
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}