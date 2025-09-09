"use client";

import HeaderBar from "@/components/layout/HeaderBar";
import GlassPanel from "@/components/ui/GlassPanel";
import SearchBar from "@/components/ui/SearchBar";
import Card from "@/components/ui/Card";
import { useEffect, useMemo, useState } from "react";
import { get } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Track, Comment } from "@/types";

export default function HomePage() {
  const [q, setQ] = useState("");
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthContext();

  useEffect(() => {
    (async () => {
      try {
        const list = await get<Track[]>(api.tracks());
        setTracks(list);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur tracks";
        setError(message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const list = await get<Comment[]>(api.comments(), { token });
        setComments(list.slice(0, 5));
      } catch {}
    })();
  }, [token]);

  const filtered = useMemo(() => {
    if (!q) return tracks ?? [];
    return (tracks ?? []).filter((t) => `${t.title} ${t.artistName ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  }, [q, tracks]);

  return (
    <div className="flex flex-col gap-4 pb-24">
      <HeaderBar />
      <SearchBar value={q} onChange={setQ} />

      {error && <Card className="p-3 text-red-400">{error}</Card>}

      {q.length === 0 ? (
        <>
          <section className="flex flex-col gap-2">
            <div className="text-sm text-white/70">Popular this week</div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {(tracks ?? []).slice(0, 10).map((t) => (
                <a key={t.id} href={`/tracks/${t.id}`}>
                  <GlassPanel className="min-w-[120px] p-3 flex flex-col items-center gap-2">
                    <div className="w-[96px] h-[96px] rounded-xl bg-white/10" />
                    <div className="text-xs font-medium truncate max-w-[96px]">{t.title}</div>
                    <div className="text-[10px] text-white/60 truncate max-w-[96px]">{t.artistName ?? "—"}</div>
                  </GlassPanel>
                </a>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm text-white/70">Recent Reviews</div>
            <div className="flex flex-col gap-3">
              {(comments ?? []).map((c) => (
                <GlassPanel key={c.id} hideHeader className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">User #{c.userId}</div>
                      <div className="text-xs text-white/70 line-clamp-2">{c.content}</div>
                    </div>
                    <div className="w-14 h-14 rounded-lg bg-white/10" />
                  </div>
                </GlassPanel>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-2">
          <div className="text-sm text-white/70">Résultats</div>
          <Card className="divide-y divide-white/5">
            {filtered.slice(0, 20).map((t) => (
              <a key={t.id} href={`/tracks/${t.id}`} className="block p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10" />
                  <div className="flex-1">
                    <div className="text-sm">{t.title}</div>
                    <div className="text-xs text-white/60">{t.artistName ?? "—"}</div>
                  </div>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/70" aria-hidden>
                    <path fill="currentColor" d="m9 18 6-6-6-6v12Z" />
                  </svg>
                </div>
              </a>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
