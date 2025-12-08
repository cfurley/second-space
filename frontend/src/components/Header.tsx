import React from 'react';
import { UserMenu } from './UserMenu';
import { getUserCache, getUserInitials, clearUserCache } from '../utils/userCache';

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function Header({ activeNav, onNavChange, searchQuery, onSearchChange }: HeaderProps & { searchQuery?: string; onSearchChange?: (query: string) => void }) {
  const navItems = ['Spaces', 'Recent', 'Shared'];
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [username, setUsername] = React.useState<string>('Username');
  const [userInitials, setUserInitials] = React.useState<string>('US');

  // Fetch user data from cache on component mount
  React.useEffect(() => {
    const user = getUserCache();
    if (user) {
      setUsername(user.username);
      setUserInitials(getUserInitials());
    }
  }, []);

  const handleLogout = () => {
    // Clear user data from cache
    clearUserCache();
    // Clear legacy localStorage key if it exists
    localStorage.removeItem('user');
    // Reset user state
    setUsername('Username');
    setUserInitials('US');
    // Close menu
    setProfileMenuOpen(false);
    // Navigate to home
    window.location.href = '/';
  };

  return (
    <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Second Space branding */}
        <div className="flex items-center">
          <h1 className="text-gray-900 dark:text-white font-semibold" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Second Space</h1>
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
              className="min-w-[80px] h-10 px-4 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 flex items-center justify-center text-gray-700 dark:text-white font-semibold transition-all border border-gray-300 dark:border-white/20"
            >
              {userInitials}
            </button>
            
            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-4 w-72 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden z-50 transform translate-y-1" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-white font-medium border-b border-gray-200 dark:border-white/10">
                    {username}
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
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