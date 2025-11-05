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
          className={`px-6 py-2.5 rounded-full text-sm font-normal transition-all ${
            activeFilter === filter
              ? 'bg-white/90 text-black'
              : 'bg-transparent text-white/60 border border-white/20 hover:bg-white/5 hover:text-white/80'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}