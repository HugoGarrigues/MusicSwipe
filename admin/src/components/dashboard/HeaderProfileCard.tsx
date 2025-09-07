"use client";

import React from "react";
import type { Me } from "@/types";

export const HeaderProfileCard: React.FC<{ user: Me | null }> = ({ user }) => {
  const initials = (user?.username || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5 shadow-[0_8px_30px_rgba(255,255,255,0.05)] flex items-center justify-between">
      <div className="flex items-center gap-4">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="avatar"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 text-sm">
            {initials}
          </div>
        )}
        <div>
          <div className="text-white font-medium leading-none">{user?.username || user?.email || "Utilisateur"}</div>
          <div className="mt-2">
            {user?.isAdmin ? (
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 backdrop-blur-md">
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-white/10 border border-white/20 text-white/70 backdrop-blur-md">
                Utilisateur
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

