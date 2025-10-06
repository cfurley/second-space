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
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            activeFilter === filter
              ? 'bg-gray-800 text-white border border-transparent'
              : 'bg-white/8 text-white border border-white/30 hover:bg-white/15'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}