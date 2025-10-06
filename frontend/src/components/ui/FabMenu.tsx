"use client";
import React, { useState } from "react";
import { Pencil, Plus, Search, X } from "lucide-react";

type Props = {
  onEdit?: () => void;
  onAdd?: (name: string) => void;
  onSearch?: () => void;
  className?: string;
};

export default function FabMenu({ onEdit, onAdd, onSearch, className = "" }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [spaceName, setSpaceName] = useState("");

  const openAdd = () => setShowAddModal(true);
  const closeAdd = () => { setShowAddModal(false); setSpaceName(""); };
  const submitAdd = () => {
    const name = spaceName.trim();
    if (!name) return;
    onAdd?.(name);
    closeAdd();
  };

  return (
    <>
      {/* Pill rail */}
      <div
        className={[
          "fixed bottom-6 right-6 z-50 flex items-center gap-3",
          "bg-zinc-900/90 border border-zinc-800 rounded-full px-3 py-2 shadow-lg",
          className,
        ].join(" ")}
      >
        <button
          onClick={onEdit}
          title="Edit Space"
          className="h-11 w-11 rounded-full flex items-center justify-center
                     bg-zinc-900 text-zinc-100 hover:bg-zinc-800
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <Pencil className="h-5 w-5" />
        </button>

        <button
          onClick={openAdd}
          title="Add Space"
          className="h-11 w-11 rounded-full flex items-center justify-center
                     bg-zinc-900 text-zinc-100 hover:bg-zinc-800
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <Plus className="h-5 w-5" />
        </button>

        <button
          onClick={onSearch}
          title="Search"
          className="h-11 w-11 rounded-full flex items-center justify-center
                     bg-zinc-900 text-zinc-100 hover:bg-zinc-800
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Add Space Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center"
          onClick={closeAdd}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 text-white rounded-lg p-6 shadow-2xl w-[340px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New Space</h2>
              <button
                className="text-zinc-400 hover:text-white"
                onClick={closeAdd}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="Enter space name..."
              className="w-full bg-zinc-800 text-white px-3 py-2 rounded-md
                         border border-zinc-700 focus:border-blue-500 outline-none"
              onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); }}
            />

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={closeAdd}
                className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
