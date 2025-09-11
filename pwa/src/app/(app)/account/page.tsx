"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import Card from "@/components/ui/Card";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { get } from "@/lib/http";
import { api } from "@/config/api";
import RequireAuth from "@/components/auth/RequireAuth";
import type { User, Rating, Comment, FollowStats, Track } from "@/types";
import Image from "next/image";
import { Star, Plus } from "lucide-react";

export default function AccountPage() {
  const { token } = useAuthContext();
  const [me, setMe] = useState<User | null>(null);
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [ratings, setRatings] = useState<Rating[] | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [followers, setFollowers] = useState<{ id: number; username: string; avatarUrl: string | null }[]>([]);
  const [recentRated, setRecentRated] = useState<{ rating: Rating; track?: Track | null }[]>([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const meResp = await get<User>(api.me(), { token });
      setMe(meResp);
      const [st, rs, cs, fl] = await Promise.all([
        get<FollowStats>(api.followStats(meResp.id), { token }).catch(() => null),
        get<Rating[]>(`${api.ratings()}?userId=${meResp.id}`, { token }).catch(() => []),
        get<Comment[]>(`${api.comments()}?userId=${meResp.id}`, { token }).catch(() => []),
        get<any[]>(api.followers(meResp.id), { token }).catch(() => []),
      ]);
      setStats(st);
      setRatings(rs);
      setComments(cs);
      setFollowers((fl ?? []).map((u: any) => ({ id: u.id, username: u.username, avatarUrl: u.avatarUrl ?? null })).slice(0, 5));

      // Enrichir les dernières notes avec les infos track
      if (rs?.length) {
        const sorted = [...rs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
        const ids = Array.from(new Set(sorted.map((r) => r.trackId)));
        const tracks = await Promise.all(ids.map((id) => get<Track>(api.track(id), { token }).catch(() => null)));
        const byId = new Map(ids.map((id, i) => [id, tracks[i]] as const));
        setRecentRated(sorted.map((r) => ({ rating: r, track: byId.get(r.trackId) })));
      } else {
        setRecentRated([]);
      }
    })();
  }, [token]);

  const reviewsCount = comments?.length ?? 0;
  const ratingsCount = ratings?.length ?? 0;
  const followersCount = (stats as any)?.followersCount ?? (stats as any)?.followers ?? 0;

  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    for (const r of ratings ?? []) {
      if (r.score >= 1 && r.score <= 5) dist[r.score - 1]++;
    }
    const total = (ratings ?? []).length;
    const avg = total ? (ratings!.reduce((s, r) => s + r.score, 0) / total) : 0;
    return { dist, total, avg };
  }, [ratings]);

  return (
    <RequireAuth>
      <div className="flex flex-col gap-4 pb-24">
        {/* Avatar large + bouton + stats */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="relative">
            {me?.avatarUrl ? (
              <Image src={me.avatarUrl} alt={me.username} width={120} height={120} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover" unoptimized />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10" />)
            }
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white/90 grid place-items-center">
              <Plus className="w-4 h-4 text-black" />
            </button>
          </div>
          <div className="text-lg font-semibold">{me?.username ?? "—"}</div>
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm text-center">
            {[ [reviewsCount, "Reviews"], [ratingsCount, "Ratings"], [followersCount, "Followers"] ].map(([n, label], i) => (
              <GlassPanel key={i} hideHeader className="p-2">
                <div className="text-base font-semibold">{n as number}</div>
                <div className="text-xs text-white/70">{label as string}</div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <GlassPanel title="Recent Activity" className="p-3">
          {recentRated?.length ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {recentRated.map((rr, i) => (
                <div key={i} className="shrink-0">
                  {rr.track ? (
                    <a href={`/tracks/${rr.track.id}`} aria-label={`Voir ${rr.track.title}`}>
                      <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden">
                        {rr.track.coverUrl ? (
                          <Image src={rr.track.coverUrl} alt={rr.track.title} width={80} height={80} className="w-20 h-20 object-cover" unoptimized />
                        ) : null}
                      </div>
                    </a>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/10" />
                  )}
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={(si < rr.rating.score ? "fill-sky-400 text-sky-400" : "text-white/30") + " w-3 h-3"} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-3 text-white/60">Aucune activité</Card>
          )}
        </GlassPanel>

        {/* Ratings distribution */}
        <GlassPanel title="Ratings" className="p-3">
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-white/40" />
            <div className="flex-1 h-24 flex items-end gap-2">
              {ratingDist.dist.map((v, i) => {
                const max = Math.max(1, ...ratingDist.dist);
                const h = Math.round((v / max) * 96); // px height within ~24*4
                return <div key={i} className="w-6 bg-sky-400 rounded-t" style={{ height: `${h}px` }} />;
              })}
            </div>
            <div className="text-xl font-semibold w-10 text-right">{ratingDist.avg.toFixed(1)}</div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={(i < Math.round(ratingDist.avg) ? "fill-sky-400 text-sky-400" : "text-white/30") + " w-3.5 h-3.5"} />
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Followers */}
        <GlassPanel title="Followers" className="p-3">
          <div className="flex gap-6">
            {followers.slice(0, 3).map((f) => (
              <div key={f.id} className="flex flex-col items-center gap-2">
                {f.avatarUrl ? (
                  <Image src={f.avatarUrl} alt={f.username} width={56} height={56} className="w-14 h-14 rounded-full object-cover" unoptimized />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                )}
                <div className="text-xs text-white/80 max-w-[80px] truncate">{f.username}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </RequireAuth>
  );
}
