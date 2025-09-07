import React from "react";

type Props = {
  title: string;
  value: number | string;
  suffix?: string;
};

export const StatCard: React.FC<Props> = ({ title, value, suffix }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="text-white/70 text-xs mb-2">{title}</div>
      <div className="text-xl font-semibold">
        {value}
        {suffix ? <span className="text-white/50 text-sm ml-1">{suffix}</span> : null}
      </div>
    </div>
  );
};

