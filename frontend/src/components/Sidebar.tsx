import React, { useState } from 'react';
import { CreateSpaceDialog } from './CreateSpaceDialog';
import { ThemeSelector } from './ThemeSelector';

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
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

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

  // Helper function to get icon component
  const getSpaceIcon = (iconName: string) => {
    // For now, keep emojis but you can replace with SVG icons later
    return <span className="text-base">{iconName}</span>;
  };

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
    <div className="glass w-[280px] border-r border-white/10 py-6 text-foreground flex flex-col h-full">
      {/* Search and Add Space Controls */}
      <div className="mb-6 px-6">
        {/* Search Button */}
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
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-all"
          />
        ) : (
          <div className="flex items-center justify-center gap-16">
            <button
              onClick={() => setSearchExpanded(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Search spaces"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            
            <CreateSpaceDialog
              onCreateSpace={(spaceData) => {
                console.log('New space data:', spaceData);
                alert(`Space "${spaceData.title}" created with icon ${spaceData.icon}!\n\nDescription: ${spaceData.description || 'None'}`);
              }}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) setSearchExpanded(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Pinned Spaces */}
      <div className="mb-6 px-4">
        <div className="text-white/40 text-[10px] uppercase tracking-widest mb-3 px-2 font-semibold">Pinned Spaces</div>
        {filteredPinnedSpaces.map((space) => (
          <button
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSpace === space.name
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            {getSpaceIcon(space.icon)}
            <span className="text-sm font-normal">{space.name}</span>
          </button>
        ))}
      </div>

      {/* All Spaces */}
      <div className="mb-6 px-4">
        <div className="text-white/40 text-[10px] uppercase tracking-widest mb-3 px-2 font-semibold">All Spaces</div>
        {filteredAllSpaces.map((space) => (
          <button
            key={space.name}
            onClick={() => onSpaceChange(space.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSpace === space.name
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white/80'
          }`}
        >
          {getSpaceIcon(space.icon)}
          <span className="text-sm font-normal">{space.name}</span>
        </button>
      ))}

      </div>
            {/* ✅ Smart Theme Selector Button */}
      <div className="mt-auto px-8 pt-4 border-t border-white/10">
        <ThemeSelector />
      </div>
    </div>
  );
}