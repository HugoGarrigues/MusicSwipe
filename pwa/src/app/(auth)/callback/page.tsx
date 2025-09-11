"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/config/api";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { saveToken } = useAuth();

  useEffect(() => {
    async function run() {
      const code = params.get("code");
      if (!code) return;
      try {
        const res = await fetch(`${API_URL}/auth/spotify/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        const token = data?.accessToken || data?.access_token;
        if (token) {
          saveToken(token);
          try {
            await fetch(`${API_URL}/users/me/recent-tracks?take=25`, { headers: { Authorization: `Bearer ${token}` } });
          } catch {}
        }
      } catch {}
      let next: string | null = null;
      try { next = localStorage.getItem("ms_next"); } catch {}
      if (next) {
        try { localStorage.removeItem("ms_next"); } catch {}
        router.replace(next);
        return;
      }
      router.replace("/discover");
    }
    run();
  }, [params, router, saveToken]);

  return null;
}

export default function CallbackPage() {
  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <Card className="w-full max-w-sm p-6 text-center text-white/80">Connexion en cours…</Card>
      <Suspense>
        <CallbackInner />
      </Suspense>
    </div>
  );
}
