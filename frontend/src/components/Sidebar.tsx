import React, { useState } from 'react';
import { CreateSpaceDialog } from './CreateSpaceDialog';

interface SidebarItem {
  icon: string;
  name: string;
  isActive?: boolean;
}

interface SidebarProps {
  activeSpace: string;
  onSpaceChange: (space: string) => void;
}

export function Sidebar({ activeSpace, onSpaceChange }: SidebarProps) {
  const pinnedSpaces: SidebarItem[] = [
    { icon: '💡', name: 'My Ideas', isActive: true },
    { icon: '🏃', name: 'Fitness Plans' },
    { icon: '🛍️', name: 'Shopping' },
    { icon: '📅', name: 'Events' },
  ];

  const allSpaces: SidebarItem[] = [
    { icon: '🍽️', name: 'Recipes' },
    { icon: '✅', name: 'Tasks' },
    { icon: '🎵', name: 'Music' },
    { icon: '📚', name: 'Learning' },
  ];

  return (
    <div className="w-[280px] bg-gray-200 dark:bg-[#1a1a1a] border-r border-gray-300 dark:border-white/10 py-8">
      <div className="mb-12 px-8">
        <div className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider mb-6">Pinned Spaces</div>
        {pinnedSpaces.map((space) => (
          <div
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`flex items-center gap-3 px-4 py-2.5 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeSpace === space.name
                ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/30 dark:border-white/30 scale-105'
                : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105 border border-transparent'
            }`}
          >
            <span className="text-lg">{space.icon}</span>
            <span className="text-sm">{space.name}</span>
          </div>
        ))}
      </div>

      <div className="mb-12 px-8">
        <div className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider mb-6">All Spaces</div>
        {allSpaces.map((space) => (
          <div
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`flex items-center gap-3 px-4 py-2.5 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeSpace === space.name
                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/30'
                : 'text-gray-600 dark:text-white/50 hover:bg-white/50 dark:hover:bg-white/5 hover:scale-105 border border-transparent'
            }`}
          >
            <span className="text-lg">{space.icon}</span>
            <span className="text-sm">{space.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}