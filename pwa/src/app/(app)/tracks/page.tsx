"use client";

import TrackCard from "@/components/track/TrackCard";
import Card from "@/components/ui/Card";
import type { Track } from "@/types";
import { useEffect, useState } from "react";
import { get } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";

export default function TracksPage() {
  const [items, setItems] = useState<Track[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthContext();

  useEffect(() => {
    (async () => {
      try {
        const data = await get<Track[]>(api.tracks(), token ? { token } : {});
        setItems(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur";
        setError(message);
      }
    })();
  }, [token]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Titres</h1>
      {error && <Card className="p-3 text-red-400">{error}</Card>}
      {!items && <Card className="p-3 text-white/70">Chargement…</Card>}
      {items?.map((t) => (
        <a key={t.id} href={`/tracks/${t.id}`}>
          <TrackCard track={t} />
        </a>
      ))}
      {items?.length === 0 && <Card className="p-4 text-white/70">Aucun titre</Card>}
    </div>
  );
}
