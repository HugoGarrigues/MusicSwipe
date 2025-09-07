"use client";

import React, { useMemo } from "react";
import type { User } from "@/types";

export const UsersList: React.FC<{ users: User[] }> = ({ users }) => {
  const items = useMemo(() => users.slice(0, 8), [users]);

  return (
    <div className="space-y-2 h-full overflow-auto">
      {items.map((u) => (
        <div key={u.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover border border-white/20" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 text-xs">
              {(u.username || u.email || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span
            className={
              "inline-flex items-center justify-center h-6 px-2 rounded-md text-xs backdrop-blur-md border " +
              (u.isAdmin
                ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-200"
                : "bg-white/10 border-white/20 text-white/70")
            }
          >
            {u.isAdmin ? "Admin" : "Utilisateur"}
          </span>
          <span className="text-white font-medium text-sm">{u.username ?? `user-${u.id}`}</span>
          <span className="text-white/60 text-xs">{u.email}</span>
          <span className="text-white/40 text-xs ml-auto">{new Date(u.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-white/60 text-sm">Aucun utilisateur</div>
      )}
    </div>
  );
};

