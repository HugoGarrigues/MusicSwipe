"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-white text-black hover:bg-white/90 focus-visible:ring-white/40",
    ghost: "bg-transparent text-white hover:bg-white/10",
    outline: "border border-white/20 text-white hover:bg-white/10",
  } as const;

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

