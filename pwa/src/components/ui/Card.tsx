import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
};

export default function Card({ children, className = "", ...rest }: Props) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}
