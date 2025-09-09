"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { saveToken } = useAuth();

  useEffect(() => {
    const t = params.get("token");
    if (t) {
      saveToken(t);
      router.replace("/discover");
    }
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
