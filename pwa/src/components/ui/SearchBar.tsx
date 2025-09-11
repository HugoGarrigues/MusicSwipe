"use client";

import React from "react";
import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "Chercher un titre à noter." }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 flex items-center gap-2">
      <svg aria-hidden viewBox="0 0 24 24" className="w-5 h-5 text-white/70">
        <Search className="w-5 h-5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent outline-none text-sm text-white w-full placeholder:text-white/60"
      />
    </div>
  );
}

