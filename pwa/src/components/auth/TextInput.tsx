"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  leftIcon?: React.ReactNode;
};

export const TextInput: React.FC<Props> = ({
  label,
  leftIcon,
  className = "",
  ...inputProps
}) => {
  const id = inputProps.id || inputProps.name || label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-white/80">
        {label}
      </label>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={id}
          {...inputProps}
          className={[
            "w-full h-11",
            leftIcon ? "pl-10" : "pl-3",
            "pr-3 bg-white/5 text-white placeholder-white/60",
            "border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40",
            "rounded-md",
            className,
          ].join(" ")}
        />
      </div>
    </div>
  );
};

