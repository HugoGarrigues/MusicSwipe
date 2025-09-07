"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Track, Me, Rating } from "@/types";
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
          fetch(api.tracks(), { cache: "no-store" }),
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

                  <div className="space-y-2 flex-1 min-h-0 overflow-y-auto nice-scrollbar">
                    {filtered.map((t) => {
                      const avg = trackAverages[t.id]?.average ?? 0;
                      const displayAvg = (Math.round((avg + Number.EPSILON) * 10) / 10).toFixed(1);
                      return (
                        <div key={t.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-white/10 border border-white/20 text-white/70 backdrop-blur-md">
                            {t.artistName || "Artiste inconnu"}
                          </span>
                          <span className="text-white font-medium text-sm">{t.title}</span>
                          <span className="text-white/60 text-xs">{t.albumName ?? "Album inconnu"}</span>
                          <span className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/10 border border-white/20 text-white/90 text-xs font-semibold backdrop-blur-md">
                            {displayAvg}
                          </span>
                        </div>
                      );
                    })}
                    {filtered.length === 0 && <div className="text-white/60 text-sm">Aucun titre</div>}
                  </div>
                </div>
              </GlassPanel>
            </div>

            {loading && <div className="mt-8 text-center text-white/60 text-sm">Chargement…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
