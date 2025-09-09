"use client";

import { useEffect, useState } from "react";
import SwipeCard from "@/components/track/SwipeCard";
import TrackCard from "@/components/track/TrackCard";
import { get, post } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Track } from "@/types";

export default function DiscoverPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const { token } = useAuthContext();
  const track = tracks[index];

  useEffect(() => {
    (async () => {
      const list = await get<Track[]>(api.tracks());
      setTracks(list);
    })();
  }, []);

  function next() {
    setIndex((i) => i + 1);
  }

  async function likeAndNext() {
    if (token && track) {
      try { await post(api.likeTrack(), { trackId: track.id }, { token }); } catch {}
    }
    next();
  }

  if (!track) {
    return <p className="text-center text-white/70">Plus de titres. Revenez bientôt !</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">Découvrir</h1>
      <SwipeCard onSwipeLeft={next} onSwipeRight={likeAndNext}>
        <TrackCard track={track} />
        <div className="mt-3 text-center text-xs text-white/60">Swipe ← dislike · Swipe → like</div>
      </SwipeCard>
    </div>
  );
}
