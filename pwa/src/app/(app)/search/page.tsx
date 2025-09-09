"use client";

import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useState } from "react";

export default function SearchPage() {
  const [q, setQ] = useState("");
  // TODO: perform API search
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Recherche</h1>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un titre ou un utilisateur" />
      <Card className="p-4 text-white/70">Saisissez une requête pour commencer</Card>
    </div>
  );
}

