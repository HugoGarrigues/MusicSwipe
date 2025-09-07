import React from "react";

type Props = React.PropsWithChildren<{ title?: string; hideHeader?: boolean }>;

export const GlassPanel: React.FC<Props> = ({ title, hideHeader, children }) => {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5 shadow-[0_8px_30px_rgba(255,255,255,0.05)] flex flex-col">
      {!hideHeader && title ? (
        <div className="mb-4 flex items-center justify-between">
          <div className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/90 text-sm md:text-base font-semibold w-full text-center">
            {title}
          </div>
        </div>
      ) : null}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
};
