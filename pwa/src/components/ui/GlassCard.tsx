import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export const GlassCard: React.FC<Props> = ({ className = "", children }) => {
  return (
    <div
      className={[
        "rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl",
        "shadow-2xl ring-1 ring-black/5 p-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

