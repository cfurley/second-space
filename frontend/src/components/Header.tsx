import React from 'react';
import { UserMenu } from './UserMenu';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function Header({ activeNav, onNavChange }: HeaderProps) {
  const navItems = ['Spaces', 'Recent', 'Shared'];

  const { isAuthenticated } = useAuth();

  return (
    <header className="glass px-10 py-5 flex items-center justify-between">
      <div className="text-white text-xl font-bold">Second Space</div>
      
      <nav className="flex gap-8">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => onNavChange(item)}
            className={`text-sm transition-colors ${
              activeNav === item ? 'text-white' : 'text-white/50 hover:text-white/75'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
  <UserMenu isLoggedIn={isAuthenticated} userName="Andrew Truong" userInitials="AT" />
      </div>
    </header>
  );
}