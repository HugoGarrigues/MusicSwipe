"use client";

import React from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Card className="p-6 text-center bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
          <div className="text-white/80 mb-3">Veuillez vous connecter pour accéder à cette section.</div>
          <a href="/login"><Button>Se connecter</Button></a>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}

