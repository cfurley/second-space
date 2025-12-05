import React from 'react';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const filters = ['Recent', 'Images', 'Links', 'Text', 'Videos'];

  return (
    <div className="flex gap-3">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeFilter === filter
              ? 'bg-gray-900 dark:bg-white/90 text-white dark:text-black border border-gray-900 dark:border-white/30 shadow-md'
              : 'bg-white dark:bg-white/8 text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/30 hover:bg-gray-50 dark:hover:bg-white/15 hover:border-gray-300 dark:hover:border-white/40 shadow-sm hover:shadow-md'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}