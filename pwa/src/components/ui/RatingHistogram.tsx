import React from "react";

export default function RatingHistogram({ bars = [1,2,3,4,5], count = 4.1 }: { bars?: number[]; count?: number }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="flex items-end gap-1">
      {bars.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-3 bg-blue-500/80 rounded-t" style={{ height: 6 + (v / max) * 32 }} />
        </div>
      ))}
      <div className="ml-3 text-white/90 text-lg font-semibold">{count.toFixed(1)}</div>
    </div>
  );
}

