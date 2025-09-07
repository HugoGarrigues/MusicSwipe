"use client";

import React, { useMemo } from "react";
import type { Comment, User } from "@/types";

export const RecentComments: React.FC<{ comments: Comment[]; users: User[] }> = ({ comments, users }) => {
  const last = useMemo(
    () => [...comments].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5),
    [comments]
  );
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  return (
    <div className="space-y-2 h-full">
      {last.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-200">Commentaire</span>
          <span className="text-white/80 text-sm">{userMap.get(c.userId)?.username ?? `user-${c.userId}`}</span>
          <span className="text-white/40 text-xs ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
      {last.length === 0 && (
        <div className="text-white/60 text-sm">Aucune activité récente</div>
      )}
    </div>
  );
};

