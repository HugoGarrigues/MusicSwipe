"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Me, User } from "@/types";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { HeaderProfileCard } from "@/components/dashboard/HeaderProfileCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { api } from "@/config/api";

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = getTokenFromCookie();
    if (!token) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` } as const;
        const meRes = await fetch(api.me(), { headers, cache: "no-store" });
        if (!meRes.ok) throw new Error("Impossible de charger le profil");
        const meJson = (await meRes.json()) as Me;
        if (!isMounted) return;
        setMe(meJson);
        setUsername(meJson.username ?? "");
        setEmail(meJson.email ?? "");
        setAvatarUrl(meJson.avatarUrl ?? "");
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Erreur de chargement");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const canSave = useMemo(() => {
    if (!username || username.length < 3) return false;
    if (!email || !email.includes("@")) return false;
    if (password && password !== password2) return false;
    return true;
  }, [username, email, password, password2]);

  async function onSave() {
    const token = getTokenFromCookie();
    if (!token || !me) return;
    if (!canSave) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: any = { username, email, avatarUrl };
      if (password) body.password = password;
      const res = await fetch(api.user(me.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Impossible d'enregistrer les modifications");
      const updated = (await res.json()) as User;
      setMe({ id: updated.id, email: updated.email, username: updated.username, isAdmin: updated.isAdmin, avatarUrl: updated.avatarUrl ?? undefined });
      setPassword("");
      setPassword2("");
    } catch (e) {
      return;
    } finally {
      setSaving(false);
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
            <div className="mb-6 text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-3 text-sm">{error}</div>
          )}

          <HeaderProfileCard user={me} />
          <div className="h-4" />

          <div className="flex-1 min-h-0 flex justify-center">
            <div className="w-full h-full">
            <GlassPanel title="Mon profil">
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-md">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-white/60 text-2xl">{(username || email || "?").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="URL de l'avatar"
                      className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    />
                  </div>
                </div>
                <div className="w-full max-w-md space-y-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Pseudo</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Votre pseudo"
                      className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre email"
                      className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Nouveau mot de passe (optionnel)</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-md bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      disabled={!canSave || saving}
                      onClick={onSave}
                      className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-600/30 hover:text-emerald-100 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50"
                    >
                      {saving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    {saveMsg && <div className="text-xs text-white/70">{saveMsg}</div>}
                  </div>
                </div>
              </div>
              {loading && <div className="mt-6 text-white/60 text-sm">Chargement…</div>}
            </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

