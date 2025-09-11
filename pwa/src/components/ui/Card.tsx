import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "plain";
};

export default function Card({ children, className = "", variant = "default", ...rest }: Props) {
  const base =
    variant === "plain"
      ? ""
      : "rounded-xl border border-white/10 bg-white/5 shadow-sm";
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
}
