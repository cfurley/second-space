import React from "react";
import { GlassCard } from "./GlassCard";

export default function Board() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 grid grid-cols-3 gap-6">
      
      <GlassCard>
        <h2 className="text-lg font-medium mb-2">Second Space</h2>
        <p className="text-sm text-muted-foreground">
          Collaborative workspace for creativity and productivity.
        </p>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-medium mb-2">Ideas Board</h2>
        <p className="text-sm text-muted-foreground">
          Capture and organize your creative sparks in one place.
        </p>
      </GlassCard>
    </div>
  );
}
