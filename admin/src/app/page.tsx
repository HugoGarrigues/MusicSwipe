"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { User, Me, Comment, Rating, Track } from "@/types";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { HeaderProfileCard } from "@/components/dashboard/HeaderProfileCard";
import { StatCard } from "@/components/ui/StatCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { UsersList } from "@/components/dashboard/UsersList";
import { TracksList } from "@/components/dashboard/TracksList";
import { api } from "@/config/api";

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackAverages, setTrackAverages] = useState<Record<number, { average: number; count: number }>>({});

  useEffect(() => {
    let isMounted = true;
    const token = getTokenFromCookie();
    if (!token) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` } as const;

        const [meRes, usersRes, commentsRes, ratingsRes, tracksRes] = await Promise.all([
          fetch(api.me(), { headers, cache: "no-store" }),
          fetch(api.users(), { headers, cache: "no-store" }),
          fetch(api.comments(), { headers, cache: "no-store" }),
          fetch(api.ratings(), { headers, cache: "no-store" }),
          fetch(api.tracks(), { cache: "no-store" }),
        ]);

        if (!meRes.ok || !usersRes.ok || !commentsRes.ok || !ratingsRes.ok || !tracksRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const [meJson, usersJson, commentsJson, ratingsJson, tracksJson] = await Promise.all([
          meRes.json(),
          usersRes.json(),
          commentsRes.json(),
          ratingsRes.json(),
          tracksRes.json(),
        ]);

        if (!isMounted) return;
        setMe(meJson ?? null);
        setUsers(usersJson ?? []);
        setComments(commentsJson ?? []);
        setRatings(ratingsJson ?? []);
        setTracks(tracksJson ?? []);

        // Fetch average rating per track (limit to first 10 to avoid excessive calls)
        const topTracks: Track[] = (tracksJson ?? []).slice(0, 10);
        const averages = await Promise.all(
          topTracks.map(async (t: Track) => {
            try {
              const r = await fetch(api.ratingAverageByTrack(t.id), { headers, cache: "no-store" });
              if (!r.ok) throw new Error();
              const d = await r.json();
              return [t.id, { average: Number(d.average ?? 0), count: Number(d.count ?? 0) }] as const;
            } catch {
              return [t.id, { average: 0, count: 0 }] as const;
            }
          })
        );
        if (!isMounted) return;
        setTrackAverages(Object.fromEntries(averages));
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Impossible de charger le dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const numUsers = users.length;
  const numComments = comments.length;
  const numTracks = tracks.length;
  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum, r) => sum + (r.score ?? 0), 0);
    return Math.round((total / ratings.length) * 10) / 10;
  }, [ratings]);

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
              <StatCard title="Nombre d'utilisateurs" value={numUsers} />
              <StatCard title="Note moyenne" value={averageRating} suffix="/5" />
              <StatCard title="Nombre de titres" value={numTracks} />
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <GlassPanel title="Gestion des Utilisateurs">
                <UsersList users={me ? users.filter((u) => u.id !== me.id) : users} />
              </GlassPanel>

              <GlassPanel title="Titres Spotify">
                <TracksList tracks={tracks} averages={trackAverages} />
              </GlassPanel>
            </div>

            {loading && (
              <div className="mt-8 text-center text-white/60 text-sm">Chargement…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
