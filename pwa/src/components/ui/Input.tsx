"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
  const base =
    "w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30";
  return <input className={`${base} ${className}`} {...props} />;
}

