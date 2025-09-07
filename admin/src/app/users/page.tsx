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
  const [selected, setSelected] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    const base = me ? users.filter((u) => u.id !== me.id) : users;
    if (!query) return base;
    const q = query.toLowerCase();
    return base.filter((u) =>
      (u.username || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    );
  }, [users, query, me]);

  const numAdmins = filtered.filter((u) => u.isAdmin).length;

  async function toggleAdmin(u: User) {
    const token = getTokenFromCookie();
    if (!token) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(api.user(u.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAdmin: !u.isAdmin }),
      });
      if (!res.ok) throw new Error("Impossible de mettre à jour le rôle");
      const updated = (await res.json()) as User;
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? { ...x, isAdmin: updated.isAdmin } : x)));
      setSelected((s) => (s && s.id === updated.id ? { ...s, isAdmin: updated.isAdmin } : s));
    } catch (e) {
      setActionError((e as any)?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteUser(u: User) {
    const token = getTokenFromCookie();
    if (!token) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(api.user(u.id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Suppression impossible");
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setSelected(null);
    } catch (e) {
      setActionError((e as any)?.message ?? "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  }

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
                    <button
                      key={u.id}
                      onClick={() => setSelected(u)}
                      className="w-full text-left flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                    >
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
                    </button>
                  ))}
                  {filtered.length === 0 && <div className="text-white/60 text-sm">Aucun utilisateur</div>}
                </div>
                </div>
              </GlassPanel>
            </div>

            {loading && <div className="mt-8 text-center text-white/60 text-sm">Chargement…</div>}
          </div>

          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
              <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-black/90 backdrop-blur-xl p-5 text-white shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {selected.username}
                      <span className="ml-2 text-white/60 text-sm">{selected.email}</span>
                    </h3>
                    <div className="text-white/60 text-xs">ID: {selected.id} • Inscrit le {new Date(selected.createdAt).toLocaleDateString()}</div>
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

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Rôle</div>
                    <div className="flex items-center justify-center mt-1 gap-1">
                      <button
                        disabled={actionLoading}
                        onClick={() => toggleAdmin(selected)}
                        className={`inline-flex items-center justify-center h-8 px-3 rounded-md ${selected.isAdmin ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-200" : "bg-white/5 border-white/20 text-white/80"}`}
                      >
                        {selected.isAdmin ? "Retirer Admin" : "Rendre Admin"}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Actions</div>
                    <div className="flex items-center justify-center mt-1 gap-1">
                      <button
                        disabled={actionLoading}
                        onClick={() => deleteUser(selected)}
                        className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-red-600/20 border border-red-500/30 text-red-200 hover:bg-red-600/30 hover:text-red-100 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/60"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                {actionError && (
                  <div className="mt-4 text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-2 text-xs">{actionError}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
