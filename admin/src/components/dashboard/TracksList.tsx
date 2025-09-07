"use client";

import React, { useMemo } from "react";
import type { Track } from "@/types";

type Averages = Record<number, { average: number; count: number }>;

export const TracksList: React.FC<{ tracks: Track[]; averages: Averages }> = ({ tracks, averages }) => {
  const items = useMemo(() => tracks.slice(0, 10), [tracks]);

  return (
    <div className="space-y-2 h-full overflow-auto">
      {items.map((t) => {
        const avg = averages[t.id]?.average ?? 0;
        const displayAvg = (Math.round((avg + Number.EPSILON) * 10) / 10).toFixed(1);

        return (
          <div key={t.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-white/10 border border-white/20 text-white/70 backdrop-blur-md">
              {t.artistName || "Artiste inconnu"}
            </span>
            <span className="text-white font-medium text-sm">{t.title}</span>
            <span className="text-white/60 text-xs">{t.albumName ?? "Album inconnu"}</span>
            <span className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/10 border border-white/20 text-white/90 text-xs font-semibold backdrop-blur-md">
              {displayAvg}
            </span>
          </div>
        );
      })}
      {items.length === 0 && <div className="text-white/60 text-sm">Aucun titre</div>}
    </div>
  );
};

