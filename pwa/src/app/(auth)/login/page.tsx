"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useState } from "react";
import { post } from "@/lib/http";
import { API_URL } from "@/config/api";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { saveToken } = useAuthContext();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await post<{ access_token: string }>(`${API_URL}/auth/login`, { email, password });
      if (res && res.access_token) {
        saveToken(res.access_token);
        router.replace("/home");
      } else {
        setError("Identifiants invalides");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      setError(message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <Card className="w-full max-w-sm p-6 flex flex-col gap-4 bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white/10" />
          <h1 className="text-xl font-semibold">Bon retour</h1>
          <p className="text-sm text-white/70 text-center">Veuillez vous connecter avec votre compte</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <label className="text-sm">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" type="email" />
          <label className="text-sm">Mot de passe</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" type="password" />
          <div className="text-sm text-white/70">Pas de compte ? <a className="underline" href="/register">S’inscrire</a></div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <Button disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</Button>
        </form>
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"/></div>
          <div className="relative flex justify-center"><span className="px-2 text-xs text-white/50 bg-background">Or sign in with</span></div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const res = await fetch(`${API_URL}/auth/spotify/auth-url`);
              const data = await res.json();
              if (data?.authUrl) window.location.href = data.authUrl as string;
            } catch {}
          }}
        >
          Spotify
        </Button>
      </Card>
    </div>
  );
}
