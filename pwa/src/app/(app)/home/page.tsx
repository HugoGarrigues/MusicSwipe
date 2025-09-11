"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import Card from "@/components/ui/Card";
import SearchBar from "@/components/ui/SearchBar";
import { useEffect, useMemo, useState } from "react";
import { get } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Track, Comment, User, Rating } from "@/types";
import Image from "next/image";
import { Star } from "lucide-react";

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [reviews, setReviews] = useState<{
    comment: Comment;
    track?: Track | null;
    rating?: number;
    user?: User | null;
  }[] | null>(null);
  const [q, setQ] = useState("");
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthContext();

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          try { const user = await get<User>(api.me(), { token }); setMe(user); } catch {}
          const recents = await get<Track[]>(api.userRecentTracks(20), { token });
          if (recents?.length) {
            setTracks(recents);
          } else {
            const list = await get<Track[]>(api.tracks(), { token });
            setTracks(list);
          }
        } else {
          const list = await get<Track[]>(api.tracks());
          setTracks(list);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur tracks";
        setError(message);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const list = await get<Comment[]>(api.comments(), { token });
        const top = list.slice(0, 3);
        setComments(top);
        const enriched = await Promise.all(
          top.map(async (c) => {
            const [t, u, rs] = await Promise.all([
              get<Track>(api.track(c.trackId), { token }).catch(() => null),
              get<User>(api.user(c.userId), { token }).catch(() => null),
              get<Rating[]>(`${api.ratings()}?userId=${c.userId}&trackId=${c.trackId}`, { token }).catch(() => []),
            ]);
            return { comment: c, track: t, user: u, rating: rs?.[0]?.score };
          })
        );
        setReviews(enriched);
      } catch {
        setReviews(null);
      }
    })();
  }, [token]);

  const filtered = useMemo(() => {
    const base = tracks ?? [];
    if (!q.trim()) return base;
    const lower = q.toLowerCase();
    return base.filter((t) => `${t.title} ${t.artistName ?? ""}`.toLowerCase().includes(lower));
  }, [q, tracks]);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header user + prompt bubble */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center gap-3">
          {me?.avatarUrl ? (
            <Image src={me.avatarUrl} alt={me.username} width={48} height={48} className="w-12 h-12 rounded-full object-cover" unoptimized />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10" />
          )}
          <div className="text-lg font-semibold">{me?.username ?? "—"}</div>
        </div>
      </div>

      {/* Search bar */}
      <SearchBar value={q} onChange={setQ} placeholder="Search a track" />

      {/* Popular this week (horizontal scroll) */}
      {q.trim().length === 0 && (
        <section className="flex flex-col gap-2">
          <div className="text-sm text-white font-semibold">Popular this week</div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {(tracks ?? []).slice(0, 10).map((t) => (
              <a key={t.id} href={`/tracks/${t.id}`} className="shrink-0">
                <GlassPanel className="min-w-[120px] p-3 flex flex-col items-center gap-2">
                  {t.coverUrl ? (
                    <Image src={t.coverUrl} alt={t.title} width={96} height={96} className="w-[96px] h-[96px] rounded-xl object-cover" unoptimized />
                  ) : (
                    <div className="w-[96px] h-[96px] rounded-xl bg-white/10" />
                  )}
                  <div className="text-xs font-medium truncate max-w-[96px] uppercase">{t.title}</div>
                  <div className="text-[10px] text-white/60 truncate max-w-[96px]">{t.artistName ?? "—"}</div>
                </GlassPanel>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Recent Reviews */}
      {q.trim().length === 0 && (
        <section className="flex flex-col gap-2">
          <div className="text-sm text-white font-semibold">Recent Reviews</div>
          <div className="flex flex-col gap-3">
            {(reviews ?? []).map((r, i) => (
              <GlassPanel key={r.comment.id} hideHeader className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {r.user?.avatarUrl ? (
                        <Image src={r.user.avatarUrl} alt={r.user.username} width={32} height={32} className="w-8 h-8 rounded-full object-cover" unoptimized />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                      )}
                      <div className="text-sm font-semibold">{r.user?.username ?? `User #${r.comment.userId}`}</div>
                    </div>
                    <div className="mt-2 text-base font-semibold">{r.track?.title ?? "—"}</div>
                    <div className="mt-1 text-xs text-white/70 line-clamp-3">{r.comment.content}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden">
                      {r.track?.coverUrl ? (
                        <Image src={r.track.coverUrl} alt={r.track.title} width={80} height={80} className="w-20 h-20 object-cover" unoptimized />
                      ) : null}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={(si < (r.rating ?? 0) ? "fill-sky-400 text-sky-400" : "text-white/30") + " w-3.5 h-3.5"} />
                      ))}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}

      {/* Search results */}
      {q.trim().length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="text-sm text-white/70">Résultats</div>
          <Card className="divide-y divide-white/5">
            {filtered.slice(0, 50).map((t) => (
              <a key={t.id} href={`/tracks/${t.id}`} className="block p-3">
                <div className="flex items-center gap-3">
                  {t.coverUrl ? (
                    <Image src={t.coverUrl} alt={t.title} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" unoptimized />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10" />
                  )}
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

      {error && <Card className="p-3 text-red-400">{error}</Card>}
    </div>
  );
}
