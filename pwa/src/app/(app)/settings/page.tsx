"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Suspense } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { isAuthenticated, clearToken } = useAuthContext();
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/login");
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Paramètres</h1>
      <Card className="p-4 flex flex-col gap-3">
        <div className="text-sm text-white/80">Connexion et préférences</div>
        <Suspense>
          <div className="flex gap-2">
            {!isAuthenticated ? (
              <a href="/login">
                <Button variant="primary">Se connecter</Button>
              </a>
            ) : (
              <Button variant="outline" onClick={logout}>Se déconnecter</Button>
            )}
          </div>
        </Suspense>
      </Card>
    </div>
  );
}
