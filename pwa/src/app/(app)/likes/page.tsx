"use client";

import Card from "@/components/ui/Card";
import RequireAuth from "@/components/auth/RequireAuth";
import { useEffect, useState } from "react";
import { get } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Like, Track } from "@/types";

type LikeWithTrack = Like & { track?: Track };

export default function LikesPage() {
  const { token } = useAuthContext();
  const [likes, setLikes] = useState<LikeWithTrack[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await get<LikeWithTrack[]>(api.likes(), { token });
        setLikes(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur";
        setError(message);
      }
    })();
  }, [token]);

  return (
    <RequireAuth>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Mes Likes</h1>
        {error && <Card className="p-3 text-red-400">{error}</Card>}
        {likes?.length ? (
          <div className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5">
            {likes.map((l) => (
              <div key={l.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <div className="text-sm">{l.track?.title ?? `Track #${l.trackId}`}</div>
                  <div className="text-xs text-white/60">{l.track?.artistName ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-white/70">Vous n’avez pas encore liké de titres</Card>
        )}
      </div>
    </RequireAuth>
  );
}
