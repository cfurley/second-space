import React from 'react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function Header({ activeNav, onNavChange }: HeaderProps) {
  const navItems = ['Spaces', 'Recent', 'Shared'];

  // Mock auth state - in a real app, this would come from an auth context/provider
  const isLoggedIn = false; // Change to true to test logged-in state

  return (
    <header className="bg-black/95 backdrop-blur-lg border-b border-white/10 px-10 py-5 flex items-center justify-between">
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
        <UserMenu isLoggedIn={isLoggedIn} userName="Andrew Truong" userInitials="AT" />
      </div>
    </header>
  );
}