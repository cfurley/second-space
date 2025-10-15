import React from 'react';
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
    <div className="w-[280px] bg-black/98 border-r border-white/10 py-8">
      <div className="mb-8 px-8">
        <CreateSpaceDialog
          onCreateSpace={(spaceData) => {
            console.log('New space data:', spaceData);
            alert(`Space "${spaceData.title}" created with icon ${spaceData.icon}!\n\nDescription: ${spaceData.description || 'None'}`);
          }}
        />
      </div>

      <div className="mb-8 px-8">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-4">Pinned Spaces</div>
        {pinnedSpaces.map((space) => (
          <div
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`flex items-center gap-3 px-4 py-2.5 mb-2 rounded-lg cursor-pointer transition-all ${
              activeSpace === space.name
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{space.icon}</span>
            <span className="text-sm">{space.name}</span>
          </div>
        ))}
      </div>

      <div className="mb-8 px-8">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-4">All Spaces</div>
        {allSpaces.map((space) => (
          <div
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`flex items-center gap-3 px-4 py-2.5 mb-2 rounded-lg cursor-pointer transition-all ${
              activeSpace === space.name
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:bg-white/5'
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