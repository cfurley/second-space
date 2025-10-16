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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Filter spaces based on search value
  const filterSpaces = (spaces: SidebarItem[]) => {
    if (!searchValue.trim()) return spaces;
    return spaces.filter(space => 
      space.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const filteredPinnedSpaces = filterSpaces(pinnedSpaces);
  const filteredAllSpaces = filterSpaces(allSpaces);

  return (
    <div className="glass w-[280px] border-r border-white/10 py-8 text-foreground">
      <div className="mb-8 px-8">
        <div className="flex items-center gap-2">
          {/* Search Bar - Hidden when dialog is open, collapses when not focused */}
          {!dialogOpen && (
            <div 
              className={`transition-all duration-300 ${
                searchExpanded ? 'flex-1' : 'w-auto'
              }`}
            >
              {searchExpanded ? (
                <input
                  type="text"
                  autoFocus
                  placeholder="Search spaces..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => {
                    if (!searchValue) setSearchExpanded(false);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-all"
                />
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all"
                >
                  <span className="text-lg">🔍</span>
                </button>
              )}
            </div>
          )}

          {/* Add Space / Close Button - Always in the same position */}
          {!searchExpanded && (
            <CreateSpaceDialog
              onCreateSpace={(spaceData) => {
                console.log('New space data:', spaceData);
                alert(`Space "${spaceData.title}" created with icon ${spaceData.icon}!\n\nDescription: ${spaceData.description || 'None'}`);
              }}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) setSearchExpanded(false); // Collapse search when dialog opens
              }}
            />
          )}
        </div>
      </div>

      <div className="mb-8 px-8">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-4">Pinned Spaces</div>
        {pinnedSpaces.map((space) => (
          <div
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`flex items-center gap-3 px-4 py-2.5 mb-2 rounded-lg cursor-pointer transition-all duration-500 ease-out ${
              activeSpace === space.name
                ? 'bg-white/15 dark:bg-white/10 text-foreground shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                : 'text-foreground/60 hover:bg-white/5 dark:hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:-translate-y-[1px]'
            }`}
          >
            <span className="text-lg">{space.icon}</span>
            <span className="text-sm">{space.name}</span>
          </div>
        ))}
      </div>

      <div className="mb-8 px-8">
        <div className="text-foreground/60 text-xs uppercase tracking-wider mb-4">All Spaces</div>
        {allSpaces.map((space) => (
          <div
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`flex items-center gap-3 px-4 py-2.5 mb-2 rounded-lg cursor-pointer transition-all duration-500 ease-out ${
              activeSpace === space.name
              ? 'bg-white/15 dark:bg-white/10 text-foreground shadow-[0_0_12px_rgba(255,255,255,0.15)]'
              : 'text-foreground/60 hover:bg-white/5 dark:hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:-translate-y-[1px]'
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