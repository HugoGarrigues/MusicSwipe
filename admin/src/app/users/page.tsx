"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { User, Me } from "@/types";
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

export default function UsersPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<User[]>([]);
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
        const [meRes, usersRes] = await Promise.all([
          fetch(api.me(), { headers, cache: "no-store" }),
          fetch(api.users(), { headers, cache: "no-store" }),
        ]);
        if (!meRes.ok || !usersRes.ok) throw new Error("Erreur lors du chargement des données");
        const [meJson, usersJson] = await Promise.all([meRes.json(), usersRes.json()]);
        if (!isMounted) return;
        setMe(meJson ?? null);
        setUsers(usersJson ?? []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Impossible de charger les utilisateurs");
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
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter((u) =>
      (u.username || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  const numAdmins = filtered.filter((u) => u.isAdmin).length;

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

            <div className="flex-1 min-h-0">
              <GlassPanel hideHeader>
                <div className="h-full min-h-0 flex flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher par pseudo/email"
                      className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    />
                    <div className="inline-flex items-center gap-2 text-white/70 text-xs">
                      <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 backdrop-blur-md">Admin</span>
                      <span className="inline-flex items-center justify-center h-6 px-2 rounded-md text-xs bg-white/10 border border-white/20 text-white/70 backdrop-blur-md">Utilisateur</span>
                    </div>
                  </div>
                <div className="space-y-2 flex-1 min-h-0 overflow-y-auto nice-scrollbar">
                  {filtered.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover border border-white/20" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 text-xs">
                          {(u.username || u.email || "?").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={
                          "inline-flex items-center justify-center h-6 px-2 rounded-md text-xs backdrop-blur-md border " +
                          (u.isAdmin
                            ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-200"
                            : "bg-white/10 border-white/20 text-white/70")
                        }
                      >
                        {u.isAdmin ? "Admin" : "Utilisateur"}
                      </span>
                      <span className="text-white font-medium text-sm">{u.username ?? `user-${u.id}`}</span>
                      <span className="text-white/60 text-xs">{u.email}</span>
                      <span className="text-white/40 text-xs ml-auto">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {filtered.length === 0 && <div className="text-white/60 text-sm">Aucun utilisateur</div>}
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
