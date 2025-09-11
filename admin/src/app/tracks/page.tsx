"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Track, Me, Rating, Comment, User } from "@/types";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { HeaderProfileCard } from "@/components/dashboard/HeaderProfileCard";
import { StatCard } from "@/components/ui/StatCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { api } from "@/config/api";

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function TracksPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [trackAverages, setTrackAverages] = useState<Record<number, { average: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Track | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [selectedAverage, setSelectedAverage] = useState<{ average: number; count: number } | null>(null);
  const [usernames, setUsernames] = useState<Map<number, string>>(new Map());

  function canDeleteComment(c: Comment): boolean {
    if (!me) return false;
    return !!me.isAdmin || c.userId === me.id;
  }

  async function deleteComment(c: Comment) {
    const token = getTokenFromCookie();
    if (!token) {
      setError("Non authentifié. Veuillez vous connecter pour accéder aux titres.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(api.comment(c.id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Suppression impossible");
      setComments((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      setDetailsError((e as any)?.message ?? "Erreur lors de la suppression");
    }
  }

  useEffect(() => {
    let isMounted = true;
    const token = getTokenFromCookie();
    if (!token) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` } as const;
        const [meRes, tracksRes, ratingsRes] = await Promise.all([
          fetch(api.me(), { headers, cache: "no-store" }),
          fetch(api.tracks(), { headers, cache: "no-store" }),
          fetch(api.ratings(), { headers, cache: "no-store" }),
        ]);
        if (!meRes.ok || !tracksRes.ok || !ratingsRes.ok) throw new Error("Erreur lors du chargement des données");
        const [meJson, tracksJson, ratingsJson] = await Promise.all([meRes.json(), tracksRes.json(), ratingsRes.json()]);
        if (!isMounted) return;
        setMe(meJson ?? null);
        setTracks(tracksJson ?? []);
        setRatings(ratingsJson ?? []);

        // Compute averages per track
        const sums = new Map<number, { sum: number; count: number }>();
        for (const r of ratingsJson ?? []) {
          const tid = Number(r.trackId);
          const ex = sums.get(tid) || { sum: 0, count: 0 };
          ex.sum += Number(r.score || 0);
          ex.count += 1;
          sums.set(tid, ex);
        }
        const avg: Record<number, { average: number; count: number }> = {};
        for (const [tid, { sum, count }] of sums.entries()) {
          avg[tid] = { average: count ? Math.round((sum / count) * 10) / 10 : 0, count };
        }
        setTrackAverages(avg);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Impossible de charger les titres");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load details for selected track
  useEffect(() => {
    const token = getTokenFromCookie();
    if (!selected || !token) return;

    let isMounted = true;
    const headers = { Authorization: `Bearer ${token}` } as const;

    async function loadDetails() {
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const [avgRes, commentsRes, likedRes, likeCountRes, usersRes] = await Promise.all([
          fetch(api.ratingAverageByTrack(selected.id), { headers, cache: "no-store" }),
          fetch(api.commentsByTrack(selected.id), { headers, cache: "no-store" }),
          fetch(api.likeStatusByTrack(selected.id), { headers, cache: "no-store" }),
          fetch(api.likeCountByTrack(selected.id), { headers, cache: "no-store" }),
          fetch(api.users(), { headers, cache: "no-store" }),
        ]);

        if (!avgRes.ok) throw new Error("Impossible de récupérer la note moyenne");
        if (!commentsRes.ok) throw new Error("Impossible de récupérer les commentaires");
        if (!likedRes.ok) throw new Error("Impossible de récupérer l'état du like");
        if (!likeCountRes.ok) throw new Error("Impossible de récupérer le nombre de likes");
        if (!usersRes.ok) throw new Error("Impossible de récupérer les utilisateurs");

        const [avg, commentsJson, likedJson, likeCountJson, usersJson] = await Promise.all([
          avgRes.json(),
          commentsRes.json(),
          likedRes.json(),
          likeCountRes.json(),
          usersRes.json(),
        ]);

        if (!isMounted) return;
        setSelectedAverage({ average: Number(avg?.average ?? 0), count: Number(avg?.count ?? 0) });
        setComments(commentsJson ?? []);
        setIsLiked(!!likedJson?.liked);
        setLikesCount(Number(likeCountJson?.count ?? 0));
        const map = new Map<number, string>((usersJson as User[]).map((u) => [u.id, u.username]));
        setUsernames(map);
      } catch (e: any) {
        if (!isMounted) return;
        setDetailsError(e?.message ?? "Erreur lors du chargement des détails");
      } finally {
        if (isMounted) setDetailsLoading(false);
      }
    }

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [selected]);

  // Close modal with ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    if (selected) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [selected]);

  async function toggleLike(track: Track) {
    const token = getTokenFromCookie();
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } as const;
    try {
      if (isLiked) {
        const res = await fetch(api.unlikeTrack(track.id), { method: "DELETE", headers });
        if (!res.ok) throw new Error("Echec du unlike");
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        const res = await fetch(api.likeTrack(), { method: "POST", headers, body: JSON.stringify({ trackId: track.id }) });
        if (!res.ok) throw new Error("Echec du like");
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
    } catch (e) {
      // best-effort; surface error in details area
      setDetailsError((e as any)?.message ?? "Action like impossible");
    }
  }

  const filtered = useMemo(() => {
    if (!query) return tracks;
    const q = query.toLowerCase();
    return tracks.filter((t) =>
      (t.title || "").toLowerCase().includes(q) ||
      (t.albumName || "").toLowerCase().includes(q) ||
      (t.artistName || "").toLowerCase().includes(q)
    );
  }, [tracks, query]);

  const ratedCount = useMemo(() => filtered.filter((t) => (trackAverages[t.id]?.count || 0) > 0).length, [filtered, trackAverages]);
  const globalAvg = useMemo(() => {
    const avgs = filtered.map((t) => trackAverages[t.id]?.average).filter((v) => typeof v === "number") as number[];
    if (!avgs.length) return 0;
    const total = avgs.reduce((a, b) => a + b, 0);
    return Math.round((total / avgs.length) * 10) / 10;
  }, [filtered, trackAverages]);

  return (
    <div className="min-h-screen w-full p-6 md:p-8 bg-gradient-to-br from-black via-slate-950 to-black text-white">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
        <aside className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <SidebarMenu />
        </aside>

        <div className="h-full flex flex-col overflow-hidden">
          {error && (
            <div className="mb-6 text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <HeaderProfileCard user={me} />
          <div className="h-4" />

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard title="Total titres" value={filtered.length} />
              <StatCard title="Titres notés" value={ratedCount} />
              <StatCard title="Note moyenne" value={globalAvg} suffix="/5" />
            </div>

            <div className="flex-1 min-h-0">
              <GlassPanel hideHeader>
                <div className="h-full min-h-0 flex flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher par titre/album/artiste"
                      className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
                    {filtered.map((t) => {
                      const avg = trackAverages[t.id]?.average ?? 0;
                      const displayAvg = (Math.round((avg + Number.EPSILON) * 10) / 10).toFixed(1);
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelected(t)}
                          className="w-full text-left flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                        >
                          <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-white/10 border border-white/20 text-white/70 backdrop-blur-md">
                            {t.artistName || "Artiste inconnu"}
                          </span>
                          <span className="text-white font-medium text-sm">{t.title}</span>
                          <span className="text-white/60 text-xs">{t.albumName ?? "Album inconnu"}</span>
                          <span className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/10 border border-white/20 text-white/90 text-xs font-semibold backdrop-blur-md">
                            {displayAvg}
                          </span>
                        </button>
                      );
                    })}
                    {filtered.length === 0 && <div className="text-white/60 text-sm">Aucun titre</div>}
                  </div>
                </div>
              </GlassPanel>
            </div>

            {loading && <div className="mt-8 text-center text-white/60 text-sm">Chargement…</div>}

            {selected && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
                <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-black/90 backdrop-blur-xl p-5 text-white shadow-2xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {selected.title}
                        <span className="ml-2 text-white/60 text-sm">{selected.artistName ?? "Artiste inconnu"}</span>
                      </h3>
                      <div className="text-white/60 text-xs">{selected.albumName ?? "Album inconnu"}</div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Fermer"
                      title="Fermer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/60">Note moyenne</div>
                      <div className="text-xl font-semibold">{selectedAverage ? (Math.round((selectedAverage.average + Number.EPSILON) * 10) / 10).toFixed(1) : "—"} <span className="text-sm text-white/60">/5</span></div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-white/60">Likes</div>
                          <div className="text-xl font-semibold">{likesCount}</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/60">Durée</div>
                      <div className="text-xl font-semibold">{selected.duration ? `${Math.floor(selected.duration / 60)}:${String(selected.duration % 60).padStart(2, "0")}` : "—"}</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-medium mb-2">Commentaires</div>
                    <div className="max-h-60 overflow-y-auto nice-scrollbar space-y-2">
                      {detailsLoading && <div className="text-white/60 text-sm">Chargement…</div>}
                      {detailsError && <div className="text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-2 text-xs">{detailsError}</div>}
                      {!detailsLoading && comments.length === 0 && <div className="text-white/60 text-sm">Aucun commentaire</div>}
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-white/60 flex-1">
                              {usernames.get(c.userId) ?? `user-${c.userId}`} • {new Date(c.createdAt).toLocaleString()}
                            </div>
                            {canDeleteComment(c) && (
                              <button
                                onClick={() => deleteComment(c)}
                                aria-label="Supprimer le commentaire"
                                title="Supprimer"
                                className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-red-600/20 border border-red-500/30 text-red-200 hover:bg-red-600/30 hover:text-red-100 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/60"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <div className="text-sm mt-1 break-words">{c.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
