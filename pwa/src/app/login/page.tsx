"use client";
import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { TextInput } from "@/components/auth/TextInput";
import { Divider } from "@/components/auth/Divider";
import { SpotifyButton } from "@/components/auth/SpotifyButton";
import { API_URL } from "@/lib/config";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Erreur ${res.status}`);
      }
      const data = await res.json();
      const token = data.accessToken || data.access_token || data.token;
      if (!token) throw new Error("Réponse d'authentification invalide");
      localStorage.setItem("token", token);
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
      const target = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
      window.location.href = target;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Impossible de se connecter";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-950 to-black p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <GlassCard>
          <AuthHeader title="Bon retour" subtitle="Veuillez vous connecter avec votre compte" />

          {error && (
            <div className="text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-2 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextInput
              label="Email"
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5a2.25 2.25 0 0 0 2.25-2.25V8.67l-7.86 4.909a3.75 3.75 0 0 1-4.98 0L1.5 8.67Z" />
                  <path d="M22.5 6.908v-.658A2.25 2.25 0 0 0 20.25 4H3.75A2.25 2.25 0 0 0 1.5 6.25v.659l8.727 5.46a2.25 2.25 0 0 0 2.546 0L22.5 6.908Z" />
                </svg>
              }
            />

            <TextInput
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12 1.5a4.5 4.5 0 0 0-4.5 4.5v3h-.75A2.25 2.25 0 0 0 4.5 11.25v7.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75v-7.5A2.25 2.25 0 0 0 17.25 9H16.5V6A4.5 4.5 0 0 0 12 1.5Zm3 7.5V6a3 3 0 1 0-6 0v3h6Z" clipRule="evenodd" />
                </svg>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full relative inline-flex items-center justify-center rounded-md bg-white text-black font-medium px-4 py-2 border border-white/10 shadow-[0_8px_30px_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-white/95 hover:text-black hover:shadow-[0_12px_40px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-0 active:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-3 text-center text-sm text-white/70">
            Pas de compte ? {" "}
            <Link href="/register" className="text-white/90 underline-offset-4 hover:underline">
              S&apos;inscrire
            </Link>
          </p>

          <div className="mt-6">
            <Divider label="Or sign in with" />
            <div className="mt-3">
              <SpotifyButton label="Spotify" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
