import React, { useState, useEffect } from 'react';
import { UserMenu } from './UserMenu';
import { getUserCache, getUserInitials, clearUserCache } from '../utils/userCache';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
// Inline accessible dialog used when the separate AlertDialog component
// is not present in this branch. Keeps tests simple and avoids import errors.

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

interface User { id: string; username: string; first_name?: string; last_name?: string }

function generateInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.[0]?.toUpperCase() || '';
  const last = lastName?.[0]?.toUpperCase() || '';
  return (first + last).slice(0, 2) || 'US';
}

export function Header({ activeNav, onNavChange, searchQuery, onSearchChange }: HeaderProps & { searchQuery?: string; onSearchChange?: (query: string) => void }) {
  const navItems = ['Spaces', 'Recent', 'Shared'];
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [username, setUsername] = useState<string>('Username');
  const [userInitials, setUserInitials] = useState<string>('US');
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch user data from cache on component mount
  useEffect(() => {
    const cached = getUserCache();
    if (cached) {
      setUser(cached);
      setUsername(cached.username || 'Username');
      // Prefer the utility for initials if available, fallback to generated initials
      try {
        const initials = getUserInitials();
        setUserInitials(initials || generateInitials(cached.first_name, cached.last_name));
      } catch (e) {
        setUserInitials(generateInitials(cached.first_name, cached.last_name));
      }
    }
  }, []);

  const handleLogoutClick = () => {
    // Open confirmation dialog instead of logging out immediately
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    // Clear user data from cache and legacy localStorage
    try { clearUserCache(); } catch (e) { /* ignore */ }
    localStorage.removeItem('user');
    // Reset local state
    setUser(null);
    setUsername('Username');
    setUserInitials('US');
    setProfileMenuOpen(false);
    setShowLogoutDialog(false);
    // Navigate to home/login
    window.location.href = '/';
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
          {/* Left: Second Space branding */}
          <div className="flex items-center">
            <h1 className="text-gray-900 dark:text-white font-semibold" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Second Space</h1>
          </div>
          {/* Center: Search input */}
          <div className="flex-1 flex justify-center">
            <input
              placeholder="Search spaces..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full max-w-xs px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-sm"
            />
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
              <div className="absolute right-0 mt-4 w-72 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden z-50 transform translate-y-1">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-white font-medium border-b border-gray-200 dark:border-white/10">
                    {username}
                  </div>
                  <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog (inline fallback) */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">⚠️ Confirm Logout</DialogTitle>
            <DialogDescription className="text-base text-gray-800 dark:text-gray-200">
              Are you sure you want to logout? You will be taken back to the login screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-row sm:justify-end gap-3">
            <Button variant="outline" onClick={handleCancelLogout} className="w-full sm:w-auto px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout} className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}