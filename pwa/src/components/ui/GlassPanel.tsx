import React from "react";

type Props = React.PropsWithChildren<{ title?: string; hideHeader?: boolean; className?: string }>; 

export default function GlassPanel({ title, hideHeader, className = "", children }: Props) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(255,255,255,0.05)] ${className}`}>
      {!hideHeader && title ? (
        <div className="mb-3">
          <div className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/90 text-sm font-semibold w-full text-center">
            {title}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}

