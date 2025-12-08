import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

interface User {  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

// Helper function to generate initials from first and last name
function generateInitials(firstName: string, lastName: string): string {
  const first = firstName?.[0]?.toUpperCase() || '';
  const last = lastName?.[0]?.toUpperCase() || '';
  return (first + last).slice(0, 2) || 'US';
}

export function Header({ activeNav, onNavChange, searchQuery, onSearchChange }: HeaderProps & { searchQuery?: string; onSearchChange?: (query: string) => void }) {
  const navItems = ['Spaces', 'Recent', 'Shared'];
  const [user, setUser] = React.useState<User | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch user data from cache on component mount
  React.useEffect(() => {
    const user = getUserCache();
    if (user) {
      setUsername(user.username);
      setUserInitials(getUserInitials());
    }
  }, []);

  const userInitials = user ? generateInitials(user.first_name, user.last_name) : 'US';

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Reset user state
    setUser(null);
    // Close dialog
    setShowLogoutDialog(false);
    // Refresh page to go back to login screen
    window.location.href = '/';
  };

  return (
    <>
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Second Space branding */}
          <div className="flex items-center">
            <h1 className="text-gray-900 dark:text-white font-semibold" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Second Space</h1>
          </div>
          
          {/* Right: Search bar with AI button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-[220px] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-4 py-1.5 pr-10 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 transition-all"
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
            
            {/* Logout replaces profile avatar */}
            <div className="relative">
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors border border-red-700 dark:border-red-600"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

     {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent
          className="
            max-w-sm w-full 
            !bg-white !dark:bg-slate-900 
            !bg-opacity-100 
            !backdrop-blur-none 
            border-2 border-red-600 dark:border-red-500 
            shadow-2xl rounded-lg p-8 pb-10
          "
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              ⚠️ Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-800 dark:text-gray-300 mt-4 text-base font-medium leading-relaxed">
              Are you sure you want to logout? You will be taken back to the login screen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col gap-3 mt-6">

            {/* Highlighted Amber Action Button */}
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="
                w-3/4 mx-auto
                !bg-amber-500 !hover:bg-amber-600
                dark:!bg-amber-400 dark:!hover:bg-amber-500
                !text-black
                px-4 py-2
                rounded-md
                font-semibold text-base
                !border !border-amber-600 dark:!border-amber-300
                shadow-md
                transition
                data-[state=open]:!bg-amber-500
              "
            >
              Logout
            </AlertDialogAction>

            {/* Cancel Button  */}
            <AlertDialogCancel
              className="
                w-3/4 mx-auto
                bg-gray-200 dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                hover:bg-gray-300 dark:hover:bg-gray-600
                px-4 py-2
                rounded-md
                font-medium
                border border-gray-400 dark:border-gray-600
                transition
                mb-2
              "
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}