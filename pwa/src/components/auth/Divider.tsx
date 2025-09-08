import React from "react";

export const Divider: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex items-center gap-3 text-white/60 text-xs">
      <div className="h-px flex-1 bg-white/20" />
      <span>{label}</span>
      <div className="h-px flex-1 bg-white/20" />
    </div>
  );
};

