import React from "react";
import { Pencil, Plus, Search } from "lucide-react"; // npm i lucide-react

type FloatingMenuProps = {
  type: string;
  content: {
    timestamp: string;
  };
  onEdit?: () => void;
  onAdd?: () => void;
  onSearch?: () => void;
};

export default function FloatingMenu({
  type,
  content,
  onEdit,
  onAdd,
  onSearch,
}: FloatingMenuProps) {
  return (
    <div
      className="bg-white/5 border border-white/10 rounded-full px-3 py-2 text-white shadow-lg backdrop-blur-sm
                 flex items-center gap-2"
      data-type={type}
      aria-label={`media-card-${type}`}
    >
      {/* Edit */}
      <button
        type="button"
        onClick={() => onEdit?.()}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10 focus:outline-none"
        aria-label="Edit space"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
        <span className="hidden sm:inline">Edit</span>
      </button>

      {/* Add */}
      <button
        type="button"
        onClick={() => onAdd?.()}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10 focus:outline-none"
        aria-label="Add space or media"
        title="Add"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add</span>
      </button>

      {/* Search */}
      <button
        type="button"
        onClick={() => onSearch?.()}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10 focus:outline-none"
        aria-label="Search media"
        title="Search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </button>

      {/* Right-side meta (kept from earlier) */}
      <div className="ml-2 pl-2 border-l border-white/10 text-xs text-white/60 hidden md:flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/50" />
        <span className="capitalize">{type}</span>
        <span>•</span>
        <span>{content.timestamp}</span>
      </div>
    </div>
  );
}
