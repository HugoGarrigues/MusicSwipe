"use client";

import Card from "@/components/ui/Card";
import GlassPanel from "@/components/ui/GlassPanel";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/config/api";
import { get } from "@/lib/http";
import { useEffect, useState } from "react";

type Props = { params: { id: string } };

export default function UserProfilePage({ params }: Props) {
  const userId = Number(params.id);
  const { token } = useAuthContext();
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [stats, setStats] = useState<{ followers: number; following: number } | null>(null);
  const [likes, setLikes] = useState<{ id: number; trackId: number; userId: number }[] | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const [u, st] = await Promise.all([
        get<{ id: number; username: string }>(api.user(userId), { token }),
        get<{ followers: number; following: number }>(api.followStats(userId), { token }).catch(() => null),
      ]);
      setUser(u);
      setStats(st);
      const ls = await get<{ id: number; trackId: number; userId: number }[]>(api.likes(), { token }).catch(() => []);
      setLikes(ls.filter((l) => l.userId === userId));
    })();
  }, [token, userId]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{user ? user.username : `Profil utilisateur #${userId}`}</h1>
      <GlassPanel hideHeader className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><div className="text-base font-semibold">{likes?.length ?? 0}</div><div className="text-xs text-white/70">Likes</div></div>
          <div><div className="text-base font-semibold">{stats?.following ?? 0}</div><div className="text-xs text-white/70">Following</div></div>
          <div><div className="text-base font-semibold">{stats?.followers ?? 0}</div><div className="text-xs text-white/70">Followers</div></div>
        </div>
      </GlassPanel>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Likes</h2>
        {likes?.length ? (
          <Card className="divide-y divide-white/5">
            {likes.map((l) => (
              <div key={l.id} className="p-3">Track #{l.trackId}</div>
            ))}
          </Card>
        ) : (
          <Card className="p-3 text-white/70">Aucun like</Card>
        )}
      </section>
    </div>
  );
}
