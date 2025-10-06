"use client";
import React, { useState } from "react";

// Use the repo’s sidebar primitives
import {
  Sidebar as Shell,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";

type Props = {
  spaces: string[];
  activeSpace: string;
  onSpaceChange: (space: string) => void;
  onAddSpace?: (name: string) => void;       // NEW
  onDeleteSpace?: (name: string) => void;    // NEW
};

export function Sidebar({
  spaces,
  activeSpace,
  onSpaceChange,
  onAddSpace,
  onDeleteSpace,
}: Props) {
  const [menuAt, setMenuAt] = useState<{x:number;y:number;space:string}|null>(null);
  return (
    <Shell variant="sidebar">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Spaces</SidebarGroupLabel>
            <button
              className="text-xs px-2 py-1 rounded-full border border-white/20 text-white/80 hover:bg-white/10"
              onClick={() => {
                const name = prompt("New space name?");
                if (name) onAddSpace?.(name);
              }}
            >
              + Add
            </button>
          </div>
          <SidebarMenu>
            {spaces.map((space) => (
              <SidebarMenuItem 
                key={space}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenuAt({ x: e.clientX, y: e.clientY, space });
                }}
                >
                <SidebarMenuButton
                  onClick={() => onSpaceChange(space)}
                  isActive={activeSpace === space}
                >
                  {space}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* simple context menu */}
      {menuAt && (
        <div
          className="fixed z-50 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-md shadow-lg"
          style={{ top: menuAt.y, left: menuAt.x }}
          onMouseLeave={() => setMenuAt(null)}
        >
          <button
            className="block px-3 py-2 text-left w-40 hover:bg-zinc-800"
            onClick={() => {
              onDeleteSpace?.(menuAt.space);
              setMenuAt(null);
            }}
          >
            Delete “{menuAt.space}”
          </button>
        </div>
      )}
    </Shell>
  );
}