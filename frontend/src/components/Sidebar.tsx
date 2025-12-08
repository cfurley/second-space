import React, { useState } from 'react';
import { CreateSpaceDialog } from './CreateSpaceDialog';
import { ThemeToggleButton } from './ThemeToggleButton';

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
  const [pinnedSpaces, setPinnedSpaces] = useState<SidebarItem[]>([
    { icon: '💡', name: 'My Ideas', isActive: true },
    { icon: '💼', name: 'Work' },
    { icon: '🏠', name: 'Personal' },
  ]);

  const [allSpaces, setAllSpaces] = useState<SidebarItem[]>([]);

  const toggleStart = (spaceName: string) => {
    // If in pinned (started), move to allSpaces
    const inPinned = pinnedSpaces.find(s => s.name === spaceName);
    if (inPinned) {
      setPinnedSpaces(prev => prev.filter(s => s.name !== spaceName));
      setAllSpaces(prev => [{ icon: inPinned.icon, name: inPinned.name }, ...prev]);
      return;
    }
    // If in allSpaces, move to pinned
    const inAll = allSpaces.find(s => s.name === spaceName);
    if (inAll) {
      setAllSpaces(prev => prev.filter(s => s.name !== spaceName));
      setPinnedSpaces(prev => [{ icon: inAll.icon, name: inAll.name }, ...prev]);
      return;
    }
  };

  

  return (
    <div className="relative w-[280px] bg-gray-200 dark:bg-[#1a1a1a] border-r border-gray-300 dark:border-white/10 py-8 pb-24">
      <div className="mb-12 pl-8 pr-4">
        <div className="mb-6">
          <div className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Starred Spaces</div>
        </div>
        {pinnedSpaces.map((space) => (
          <div
            key={space.name}
            className={`relative flex items-center justify-between gap-3 pl-4 pr-0 py-2.5 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeSpace === space.name
                ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/30 dark:border-white/30 scale-105'
                : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 flex-1" onClick={() => onSpaceChange(space.name)}>
              <span className="text-lg">{space.icon}</span>
              <span className="text-sm">{space.name}</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: '40px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleStart(space.name); }}
                className="text-sm p-1 rounded hover:bg-white/5 dark:hover:bg-white/5"
                aria-label={`Unstart ${space.name}`}
              >
                ⭐
              </button>
              {/* delete button removed */}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-12 pl-8 pr-4">
        <div className="mb-6">
          <div className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">All Spaces</div>
        </div>
        {allSpaces.map((space) => (
          <div
            key={space.name}
            className={`relative flex items-center justify-between gap-3 pl-4 pr-0 py-2.5 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeSpace === space.name
                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/30'
                : 'text-gray-600 dark:text-white/50 hover:bg-white/50 dark:hover:bg-white/5 hover:scale-105 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 flex-1" onClick={() => onSpaceChange(space.name)}>
              <span className="text-lg">{space.icon}</span>
              <span className="text-sm">{space.name}</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: '40px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleStart(space.name); }}
                className="text-sm p-1 rounded hover:bg-white/5 dark:hover:bg-white/5"
                aria-label={`Start ${space.name}`}
              >
                ☆
              </button>
              {/* delete button removed */}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom controls positioned at the very bottom of the page */}
      <ThemeToggleButton />
      <CreateSpaceDialog buttonClassName="w-12 h-12 aspect-square bg-gray-300 dark:bg-[#2C2C2C] text-gray-800 dark:text-white rounded-full border-none cursor-pointer flex items-center justify-center text-2xl shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300" 
        buttonStyle={{ position: 'fixed', left: '232px', bottom: '16px', zIndex: 50 }}
        onCreateSpace={(spaceData) => {
          // add new spaces to All Spaces by default
          setAllSpaces(prev => [{ icon: spaceData.icon, name: spaceData.title }, ...prev]);
        }} />
    </div>
  );
}