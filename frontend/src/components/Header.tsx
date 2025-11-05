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
    <header className="glass px-10 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white text-xl font-bold tracking-tight">Second Space</div>
        <div className="flex items-center gap-4">
          <UserMenu isLoggedIn={isLoggedIn} userName="Andrew Truong" userInitials="AT" />
        </div>
      </div>
      
      <nav className="flex gap-6">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => onNavChange(item)}
            className={`px-0 py-1 text-sm font-normal transition-all relative ${
              activeNav === item 
                ? 'text-white' 
                : 'text-white/50 hover:text-white/75'
            }`}
          >
            {item}
            {activeNav === item && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}