"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { get } from "@/lib/http";
import { api } from "@/config/api";
import RequireAuth from "@/components/auth/RequireAuth";
import type { User, Rating, Comment, FollowStats } from "@/types";

export default function AccountPage() {
  const { token } = useAuthContext();
  const [me, setMe] = useState<User | null>(null);
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [ratings, setRatings] = useState<Rating[] | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const meResp = await get<User>(api.me(), { token });
      setMe(meResp);
      const [st, rs, cs] = await Promise.all([
        get<FollowStats>(api.followStats(meResp.id), { token }).catch(() => null),
        get<Rating[]>(`${api.ratings()}?userId=${meResp.id}`, { token }).catch(() => []),
        get<Comment[]>(`${api.comments()}?userId=${meResp.id}`, { token }).catch(() => []),
      ]);
      setStats(st);
      setRatings(rs);
      setComments(cs);
    })();
  }, [token]);

  const reviewsCount = comments?.length ?? 0;
  const ratingsCount = ratings?.length ?? 0;
  const followersCount = stats?.followers ?? 0;

  return (
    <RequireAuth>
      <div className="flex flex-col gap-4 pb-24">
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="w-24 h-24 rounded-full bg-white/10" />
          <div className="text-lg font-semibold">{me?.username ?? "—"}</div>
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm text-center">
            {[
              [reviewsCount, "Reviews"],
              [ratingsCount, "Ratings"],
              [followersCount, "Followers"],
            ].map(([n, label], i) => (
              <GlassPanel key={i} hideHeader className="p-2">
                <div className="text-base font-semibold">{n as number}</div>
                <div className="text-xs text-white/70">{label as string}</div>
              </GlassPanel>
            ))}
          </div>
        </div>

        <GlassPanel title="Recent Activity" className="p-3">
          {comments?.length ? (
            <div className="flex gap-3">
              {comments.slice(0, 4).map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-xl bg-white/10" />
              ))}
            </div>
          ) : (
            <Card className="p-3 text-white/60">Aucune activité</Card>
          )}
        </GlassPanel>

        <GlassPanel title="Ratings" className="p-3">
          <div className="h-24 grid place-items-center text-white/60">{ratingsCount} notes</div>
        </GlassPanel>

        <GlassPanel title="Followers" className="p-3">
          <div className="flex gap-3">
            {Array.from({ length: Math.min(followersCount, 5) }).map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-white/10" />
            ))}
          </div>
        </GlassPanel>
      </div>
    </RequireAuth>
  );
}
