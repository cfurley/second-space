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
    { icon: '🏃', name: 'Fitness Plans' },
    { icon: '🛍️', name: 'Shopping' },
    { icon: '📅', name: 'Events' },
  ]);

  const [allSpaces, setAllSpaces] = useState<SidebarItem[]>([
    { icon: '🍽️', name: 'Recipes' },
    { icon: '✅', name: 'Tasks' },
    { icon: '🎵', name: 'Music' },
    { icon: '📚', name: 'Learning' },
  ]);

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

  const [deletingSpace, setDeletingSpace] = useState<string | null>(null);

  // Close delete popout when clicking outside
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!deletingSpace) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If click inside the popout or on a delete button, do nothing
      if (target.closest('.space-delete-popout')) return;
      if (target.closest('[data-delete-button]')) return;
      setDeletingSpace(null);
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [deletingSpace]);

  const confirmDelete = (spaceName: string) => {
    // Remove from both lists if present
    setPinnedSpaces(prev => prev.filter(s => s.name !== spaceName));
    setAllSpaces(prev => prev.filter(s => s.name !== spaceName));
    // If the deleted space was active, clear selection
    if (activeSpace === spaceName) {
      onSpaceChange('');
    }
    setDeletingSpace(null);
  };

  return (
    <div className="relative w-[280px] bg-gray-200 dark:bg-[#1a1a1a] border-r border-gray-300 dark:border-white/10 py-8">
      <div className="mb-12 px-8">
        <div className="mb-6">
          <div className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Starred Spaces</div>
        </div>
        {pinnedSpaces.map((space) => (
          <div
            key={space.name}
            className={`relative flex items-center justify-between gap-3 px-4 py-2.5 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeSpace === space.name
                ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/30 dark:border-white/30 scale-105'
                : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 w-full" onClick={() => onSpaceChange(space.name)}>
              <span className="text-lg">{space.icon}</span>
              <span className="text-sm">{space.name}</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={(e) => { e.stopPropagation(); toggleStart(space.name); }}
                className="ml-1 text-sm px-2 py-1 rounded hover:bg-white/5 dark:hover:bg-white/5"
                aria-label={`Unstart ${space.name}`}
              >
                ⭐
              </button>
              <button
                data-delete-button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingSpace(space.name);
                  // ensure the clicked button receives focus to avoid focus/interaction glitches
                  const bt = e.currentTarget as HTMLElement;
                  // defer focus slightly to allow state update/render
                  setTimeout(() => bt.focus(), 0);
                }}
                className="ml-1 text-sm px-2 py-1 rounded hover:bg-red-600/10 text-red-400"
                aria-label={`Delete ${space.name}`}
                title="Delete"
              >
                🗑️
              </button>

              {deletingSpace === space.name && (
                <div className="space-delete-popout absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg p-3 z-30 shadow-lg">
                  <p className="text-sm text-white mb-2">Are you sure you want to delete "{space.name}"?</p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingSpace(null); }}
                      className="px-2 py-1 text-sm rounded bg-card hover:bg-card"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmDelete(space.name); }}
                      className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-12 px-8">
        <div className="mb-6">
          <div className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">All Spaces</div>
        </div>
        {allSpaces.map((space) => (
          <div
            key={space.name}
            className={`relative flex items-center justify-between gap-3 px-4 py-2.5 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeSpace === space.name
                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/30'
                : 'text-gray-600 dark:text-white/50 hover:bg-white/50 dark:hover:bg-white/5 hover:scale-105 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 w-full" onClick={() => onSpaceChange(space.name)}>
              <span className="text-lg">{space.icon}</span>
              <span className="text-sm">{space.name}</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={(e) => { e.stopPropagation(); toggleStart(space.name); }}
                className="ml-1 text-sm px-2 py-1 rounded hover:bg-white/5 dark:hover:bg-white/5"
                aria-label={`Start ${space.name}`}
              >
                ☆
              </button>
              <button
                data-delete-button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingSpace(space.name);
                  const bt = e.currentTarget as HTMLElement;
                  setTimeout(() => bt.focus(), 0);
                }}
                className="ml-1 text-sm px-2 py-1 rounded hover:bg-red-600/10 text-red-400"
                aria-label={`Delete ${space.name}`}
                title="Delete"
              >
                🗑️
              </button>

              {deletingSpace === space.name && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg p-3 z-30 shadow-lg">
                  <p className="text-sm text-white mb-2">Are you sure you want to delete "{space.name}"?</p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingSpace(null); }}
                      className="px-2 py-1 text-sm rounded bg-card hover:bg-card"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmDelete(space.name); }}
                      className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom controls positioned at the very bottom of the sidebar */}
      <div className="absolute left-4 bottom-6">
        <ThemeToggleButton embedded />
      </div>
      <div className="absolute right-4 bottom-6">
        <CreateSpaceDialog buttonClassName="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white text-2xl shadow-lg" onCreateSpace={(spaceData) => {
          // add new spaces to All Spaces by default
          setAllSpaces(prev => [{ icon: spaceData.icon, name: spaceData.title }, ...prev]);
        }} />
      </div>
    </div>
  );
}