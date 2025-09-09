"use client";

import React from "react";

export default function RatingStars({ value = 0, onChange, size = 20 }: { value?: number; onChange?: (v: number) => void; size?: number }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          aria-label={`Note ${s}`}
          onClick={() => onChange?.(s)}
          className="text-white"
        >
          <svg viewBox="0 0 24 24" width={size} height={size} className={s <= value ? "opacity-100" : "opacity-40"}>
            <path fill="currentColor" d="M12 17.3 6.2 21l1.5-6.5L2 9.2l6.6-.6L12 2l3.4 6.6 6.6.6-5.7 5.3L17.8 21Z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

