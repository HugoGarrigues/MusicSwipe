"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
};

type Me = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  avatarUrl?: string | null;
};

type Comment = {
  id: number;
  userId: number;
  trackId: number;
  content: string;
  createdAt: string;
};

type Rating = {
  id: number;
  userId: number;
  trackId: number;
  score: number;
  createdAt: string;
  updatedAt: string;
};

type Track = {
  id: number;
  spotifyId?: string | null;
  title: string;
  artistName?: string | null;
  albumName?: string | null;
  duration?: number | null;
  previewUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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
          fetch(`${API_URL}/auth/me`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/users`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/comments`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/ratings`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/tracks`, { cache: "no-store" }),
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
              const r = await fetch(`${API_URL}/ratings/track/${t.id}/average`, { headers, cache: "no-store" });
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
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <SidebarMenu />
        </aside>

        <div>
          {error && (
            <div className="mb-6 text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <HeaderProfileCard user={me} />
          <div className="h-4" />

          <div className="flex flex-col min-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard title="Nombre d'utilisateurs" value={numUsers} />
              <StatCard title="Note moyenne" value={averageRating} suffix="/5" />
              <StatCard title="Nombre de titres" value={numTracks} />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <GlassPanel title="Gestion des Utilisateurs">
                <UsersList users={users} />
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

function SidebarMenu() {
  const items = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/users", label: "Utilisateurs", icon: "users" },
    { href: "/comments", label: "Commentaires", icon: "comments" },
    { href: "/likes", label: "Likes", icon: "likes" },
  ] as const;

  const renderIcon = (name: typeof items[number]["icon"]) => {
    const cls = "h-4 w-4";
    switch (name) {
      case "dashboard":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M3.75 3A.75.75 0 0 0 3 3.75v4.5A.75.75 0 0 0 3.75 9h4.5A.75.75 0 0 0 9 8.25v-4.5A.75.75 0 0 0 8.25 3h-4.5Z"/>
            <path d="M14.25 3A.75.75 0 0 0 13.5 3.75v7.5a.75.75 0 0 0 .75.75h5.25a.75.75 0 0 0 .75-.75v-7.5A.75.75 0 0 0 19.5 3h-5.25Z"/>
            <path d="M3.75 13.5A.75.75 0 0 0 3 14.25v6a.75.75 0 0 0 .75.75h6a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75h-6Z"/>
            <path d="M13.5 15.75a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-5.25a.75.75 0 0 1-.75-.75v-4.5Z"/>
          </svg>
        );
      case "users":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M7.5 6.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"/>
            <path d="M2.25 19.5a6.75 6.75 0 1 1 13.5 0v.75H2.25v-.75Z"/>
            <path d="M17.25 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"/>
            <path d="M18.75 12.75a5.25 5.25 0 0 1 3 4.725v.775H16.5v-.775a6.72 6.72 0 0 0-1.23-3.84 6.72 6.72 0 0 1 3.48-.885h0Z"/>
          </svg>
        );
      case "comments":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 3V6A1.5 1.5 0 0 1 4.5 4.5Z"/>
          </svg>
        );
      case "likes":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M11.645 20.91 3.61 12.875a5.25 5.25 0 1 1 7.424-7.425l.966.966.966-.966a5.25 5.25 0 0 1 7.424 7.425L12.355 20.91a.5.5 0 0 1-.71 0Z"/>
          </svg>
        );
      default:
        return null;
    }
  };
  return (
    <nav className="flex flex-col gap-5 h-full">
      <div className="px-3 py-2 text-white font-semibold text-center text-xl">MusicSwipe</div>
      <div className="flex flex-col gap-4">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="group inline-flex items-center gap-3 rounded-lg px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition text-white no-underline hover:no-underline">
            <span className="opacity-80 group-hover:opacity-100">{renderIcon(it.icon)}</span>
            <span className="text-sm text-white/90 group-hover:text-white">{it.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <button
          className="w-full h-9 px-3 rounded-md inline-flex items-center justify-center gap-2 bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/30 backdrop-blur-md transition"
          onClick={() => {
            try {
              localStorage.removeItem("token");
            } catch {}
            document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
            window.location.href = "/login";
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

function HeaderProfileCard({ user }: { user: Me | null }) {
  const initials = (user?.username || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5 shadow-[0_8px_30px_rgba(255,255,255,0.05)] flex items-center justify-between">
      <div className="flex items-center gap-4">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="avatar" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 text-sm">
            {initials}
          </div>
        )}
        <div>
          <div className="text-white font-medium leading-none">{user?.username || user?.email || "Utilisateur"}</div>
          <div className="mt-2">
            {user?.isAdmin ? (
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 backdrop-blur-md">
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-white/10 border border-white/20 text-white/70 backdrop-blur-md">
                Utilisateur
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix }: { title: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="text-white/70 text-xs mb-2">{title}</div>
      <div className="text-xl font-semibold">
        {value}
        {suffix ? <span className="text-white/50 text-sm ml-1">{suffix}</span> : null}
      </div>
    </div>
  );
}

function GlassPanel({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5 shadow-[0_8px_30px_rgba(255,255,255,0.05)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/90 text-sm md:text-base font-semibold w-full text-center">
          {title}
        </div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function UsersList({ users }: { users: User[] }) {
  const items = useMemo(() => users.slice(0, 8), [users]);
  return (
    <div className="space-y-2 h-full overflow-auto">
      {items.map((u) => (
        <div key={u.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover border border-white/20" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 text-xs">
              {(u.username || u.email || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className={
            "inline-flex items-center justify-center h-6 px-2 rounded-md text-xs backdrop-blur-md border " +
            (u.isAdmin
              ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-200"
              : "bg-white/10 border-white/20 text-white/70")
          }>
            {u.isAdmin ? "Admin" : "Utilisateur"}
          </span>
          <span className="text-white font-medium text-sm">{u.username ?? `user-${u.id}`}</span>
          <span className="text-white/60 text-xs">{u.email}</span>
          <span className="text-white/40 text-xs ml-auto">{new Date(u.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-white/60 text-sm">Aucun utilisateur</div>
      )}
    </div>
  );
}

function RecentComments({ comments, users }: { comments: Comment[]; users: User[] }) {
  const last = useMemo(() => [...comments].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5), [comments]);
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
}

function TracksList({ tracks, averages }: { tracks: Track[]; averages: Record<number, { average: number; count: number }> }) {
  const items = useMemo(() => tracks.slice(0, 10), [tracks]);
  return (
    <div className="space-y-2 h-full overflow-auto">
      {items.map((t) => {
        const avg = averages[t.id]?.average ?? 0;
        const count = averages[t.id]?.count ?? 0;
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
      {items.length === 0 && (
        <div className="text-white/60 text-sm">Aucun titre</div>
      )}
    </div>
  );
}

