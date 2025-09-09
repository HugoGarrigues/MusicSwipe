import React from "react";

export default function UserAvatar({ src, alt, size = 40 }: { src?: string | null; alt?: string; size?: number }) {
  const fallback = (
    <div
      className="inline-flex items-center justify-center rounded-full bg-white/10 text-white/70"
      style={{ width: size, height: size }}
    >
      <span className="text-sm">👤</span>
    </div>
  );
  if (!src) return fallback;
  // Use native img to avoid adding Image domains
  return (
    <img
      src={src}
      alt={alt ?? "Avatar"}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
}
