import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { setUserCache, getUserCache, clearUserCache, getUserDisplayName, getUserInitials } from '../utils/userCache';

interface UserMenuProps {
  // Mock user state - in a real app, this would come from auth context
  isLoggedIn?: boolean;
  userName?: string;
  userInitials?: string;
}

export function UserMenu({ 
  isLoggedIn = false, 
  userName: userNameProp = '',
  userInitials = 'AT'
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [cachedUser, setCachedUser] = useState<any>(() => getUserCache());
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLoginForm(false);
        setShowSignupForm(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    // Simulate login success and cache user data
    const userData = {
      id: '1',
      username,
      first_name: username,
      last_name: '',
      email: email || 'user@example.com'
    };
    setUserCache(userData as any);
    setCachedUser(getUserCache());
    setUsername('');
    setPassword('');
    setIsOpen(false);
    setShowLoginForm(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual signup logic
    // Simulate signup success and cache user data
    const userData = {
      id: '1',
      username,
      first_name: username,
      last_name: '',
      email: email || 'user@example.com'
    };
    setUserCache(userData as any);
    setCachedUser(getUserCache());
    setUsername('');
    setEmail('');
    setPassword('');
    setIsOpen(false);
    setShowSignupForm(false);
  };

  const handleLogout = () => {
    // Clear user data from cache and localStorage
    clearUserCache();
    setCachedUser(null);
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar / Login Button */}
      {(isLoggedIn || cachedUser) ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-full bg-gray-200 text-gray-800 border border-gray-300 dark:bg-[#1f1f1f] dark:text-white dark:border-white/30 flex items-center justify-center text-xs hover:bg-gray-300 dark:hover:bg-[#2a2a2a] transition-all"
        >
          {cachedUser ? getUserInitials() : userInitials}
        </button>
      ) : null}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-12 w-[280px] rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden border border-gray-200 dark:border-white/20"
          style={{
            background: 'var(--ss-glass-bg, rgba(255,255,255,0.9))',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {(isLoggedIn || cachedUser) ? (
            /* Logged In Menu */
            <div className="p-4">
              <div className="mb-4 pb-4 border-b border-white/10">
                <p className="text-gray-900 dark:text-white text-sm font-medium">{cachedUser ? getUserDisplayName() : (userNameProp || 'User')}</p>
                <p className="text-gray-500 dark:text-white/60 text-xs mt-1">{cachedUser?.email || 'user@example.com'}</p>
              </div>
              
              <button
                onClick={() => {
                  console.log('Settings clicked');
                  alert('Settings page (not implemented)');
                }}
                className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                ⚙️ Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all text-sm mt-1"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            /* Not Logged In Menu */
            <div className="p-4">
              {!showLoginForm && !showSignupForm ? (
                /* Initial Menu - Choose Login or Signup */
                <>
                  <button
                    onClick={() => setShowLoginForm(true)}
                    className="w-full px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-sm font-medium"
                  >
                    Login
                  </button>
                  
                  <button
                    onClick={() => setShowSignupForm(true)}
                    className="w-full px-4 py-2.5 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all text-sm mt-2"
                    >
                    Sign Up
                  </button>
                </>
              ) : showLoginForm ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-white text-base font-semibold">Login</h3>
                    <p className="text-white/50 text-xs mt-1">Enter your credentials</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-white/90 text-xs">
                      Username
                    </Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 h-9 text-sm dark:bg-[#111111] dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700 dark:text-white/90 text-xs">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 h-9 text-sm dark:bg-[#111111] dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                      required
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLoginForm(false)}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-100 dark:flex-1 dark:bg-[#111111] dark:border-white/10 dark:text-white/70 dark:hover:bg-[#1a1a1a] dark:hover:text-white h-9 text-sm"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
                    >
                      Login
                    </Button>
                  </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginForm(false);
                        setShowSignupForm(true);
                      }}
                      className="w-full text-center text-gray-600 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/70 text-xs mt-2"
                    >
                      Don't have an account? Sign up
                    </button>
                </form>
              ) : (
                /* Signup Form */
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-gray-900 dark:text-white text-base font-semibold">Sign Up</h3>
                    <p className="text-gray-600 dark:text-white/50 text-xs mt-1">Create a new account</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-gray-700 dark:text-white/90 text-xs">
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 h-9 text-sm dark:bg-[#111111] dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-700 dark:text-white/90 text-xs">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 h-9 text-sm dark:bg-[#111111] dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-700 dark:text-white/90 text-xs">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 h-9 text-sm dark:bg-[#111111] dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                      required
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSignupForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-[#111111] dark:border-white/10 dark:text-white/70 dark:hover:bg-[#1a1a1a] dark:hover:text-white h-9 text-sm"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
                    >
                      Sign Up
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSignupForm(false);
                      setShowLoginForm(true);
                    }}
                  className="w-full text-center text-gray-600 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/70 text-xs mt-2"
                  >
                    Already have an account? Login
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
