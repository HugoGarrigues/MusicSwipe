"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      const token = data.access_token || data.token || data.accessToken;
      if (!token) {
        throw new Error("Réponse d'authentification invalide");
      }

      localStorage.setItem("token", token);
      const maxAgeSeconds = 60 * 60 * 24 * 7;
      document.cookie = `token=${token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
      router.push("/");
    } catch (e: any) {
      setError(e?.message ?? "Impossible de se connecter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-950 to-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-white/30 opacity-90" />
            <h1 className="text-white">Connexion</h1>
            <p className="text-white/70 text-sm">Accédez au panneau d'administration</p>
          </div>

          {error && (
            <div className="text-red-200 bg-red-500/20 border border-red-400/30 rounded-md p-2 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-white/80">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                  {/* envelope icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5a2.25 2.25 0 0 0 2.25-2.25V8.67l-7.86 4.909a3.75 3.75 0 0 1-4.98 0L1.5 8.67Z" />
                    <path d="M22.5 6.908v-.658A2.25 2.25 0 0 0 20.25 4H3.75A2.25 2.25 0 0 0 1.5 6.25v.659l8.727 5.46a2.25 2.25 0 0 0 2.546 0L22.5 6.908Z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  aria-invalid={!!error}
                  className="w-full h-11 pl-10 pr-3 bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 rounded-md"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-white/80">Mot de passe</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                  {/* lock icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M12 1.5a4.5 4.5 0 0 0-4.5 4.5v3h-.75A2.25 2.25 0 0 0 4.5 11.25v7.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75v-7.5A2.25 2.25 0 0 0 17.25 9H16.5V6A4.5 4.5 0 0 0 12 1.5Zm3 7.5V6a3 3 0 1 0-6 0v3h6Z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pl-10 pr-3 bg-white/5 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-white text-black font-medium px-4 py-2 border border-white/10 shadow-lg hover:bg-black hover:text-white transition-colors disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-white/60">
            En vous connectant, vous acceptez les conditions d'utilisation.
          </div>
        </div>
      </div>
    </div>
  );
}


