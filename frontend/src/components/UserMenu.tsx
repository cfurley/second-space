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
            className="w-9 h-9 rounded-full bg-[#1f1f1f] border border-white/30 flex items-center justify-center text-white text-xs hover:bg-[#2a2a2a] transition-all"
        >
          {cachedUser ? getUserInitials() : userInitials}
        </button>
      ) : null}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-12 w-[280px] rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
          style={{
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), 0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
        >
             <div 
               className="border border-white/20 rounded-3xl"
               style={{
                 backgroundColor: '#1a1a1a',
                 opacity: 1,
                 backdropFilter: 'none',
                 boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
               }}
          >
          {(isLoggedIn || cachedUser) ? (
            /* Logged In Menu */
            <div className="p-4">
              <div className="mb-4 pb-4 border-b border-white/10">
                <p className="text-white text-sm font-medium">{cachedUser ? getUserDisplayName() : (userNameProp || 'User')}</p>
                <p className="text-white/50 text-xs mt-1">{cachedUser?.email || 'user@example.com'}</p>
              </div>
              
              <button
                onClick={() => {
                  console.log('Settings clicked');
                  alert('Settings page (not implemented)');
                }}
                className="w-full text-left px-4 py-2.5 text-white/70 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all text-sm"
              >
                ⚙️ Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-700 rounded-lg transition-all text-sm mt-1"
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
                    className="w-full px-4 py-2.5 text-white/70 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all text-sm mt-2"
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
                        className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white/90 text-xs">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLoginForm(false)}
                        className="flex-1 bg-[#111111] border-white/10 text-white/70 hover:bg-[#1a1a1a] hover:text-white h-9 text-sm"
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
                    className="w-full text-center text-white/50 hover:text-white/70 text-xs mt-2"
                  >
                    Don't have an account? Sign up
                  </button>
                </form>
              ) : (
                /* Signup Form */
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-white text-base font-semibold">Sign Up</h3>
                    <p className="text-white/50 text-xs mt-1">Create a new account</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-white/90 text-xs">
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/90 text-xs">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/90 text-xs">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSignupForm(false)}
                        className="flex-1 bg-[#111111] border-white/10 text-white/70 hover:bg-[#1a1a1a] hover:text-white h-9 text-sm"
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
                    className="w-full text-center text-white/50 hover:text-white/70 text-xs mt-2"
                  >
                    Already have an account? Login
                  </button>
                </form>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
