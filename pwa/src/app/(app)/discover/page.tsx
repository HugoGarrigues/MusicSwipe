"use client";

import { useEffect, useRef, useState } from "react";
import SwipeCard from "@/components/track/SwipeCard";
import TrackCard from "@/components/track/TrackCard";
import SwipeActionBar from "@/components/track/SwipeActionBar";
import { get, post } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Track } from "@/types";

export default function DiscoverPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const { token } = useAuthContext();
  const sizeRef = useRef(25);
  const seenRef = useRef<Set<number>>(new Set());
  const track = tracks[index];

  async function reloadTracks(increment = false) {
    if (increment) sizeRef.current = Math.min(50, sizeRef.current + 10);
    try {
      let list: Track[] = [];
      if (token) {
        list = await get<Track[]>(api.userRecentTracks(sizeRef.current), { token });
        if (!list?.length) {
          list = await get<Track[]>(api.tracks(), { token });
        }
      } else {
        list = await get<Track[]>(api.tracks());
      }
      const seen = seenRef.current;
      let filtered = (list ?? []).filter((t) => !seen.has(t.id));
      if (!filtered.length && token && sizeRef.current < 500) {
        // Try again with a larger window of recents
        sizeRef.current = Math.min(50, sizeRef.current + 10);
        const bigger = await get<Track[]>(api.userRecentTracks(sizeRef.current), { token });
        filtered = (bigger ?? []).filter((t) => !seen.has(t.id));
      }
      if (filtered.length) {
        filtered.forEach((t) => seen.add(t.id));
        setTracks(filtered);
        setIndex(0);
      } else {
        // fallback: clear seen to avoid empty UI
        seen.clear();
        setTracks(list ?? []);
        setIndex(0);
      }
    } catch {}
  }

  useEffect(() => {
    // reset session window on auth change
    seenRef.current.clear();
    sizeRef.current = 25;
    reloadTracks();
  }, [token]);

  function next() {
    setIndex((i) => {
      const ni = i + 1;
      if (ni >= tracks.length) {
        reloadTracks(true);
        return 0;
      }
      return ni;
    });
  }

  async function likeAndNext() {
    if (token && track) {
      try { await post(api.likeTrack(), { trackId: track.id }, { token }); } catch {}
    }
    next();
  }

  if (!track) {
    return <p className="text-center text-white/70">Plus de titres. Revenez bientÃƒÆ’Ã‚Â´t !</p>;
  }

  return (
    <div className="flex flex-col gap-3 pb-32">
      <h1 className="text-xl font-semibold">DÃƒÆ’Ã‚Â©couvrir</h1>
      <SwipeCard onSwipeLeft={next} onSwipeRight={likeAndNext}>
        <TrackCard track={track} />
        <div className="mt-3 text-center text-xs text-white/60">Swipe ÃƒÂ¢Ã¢â‚¬Â Ã‚Â dislike Ãƒâ€šÃ‚Â· Swipe ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ like</div>
        <div className="mt-3 text-center text-xs text-white/60">Swipe ← dislike · Swipe → like</div>
      </SwipeCard>
      <SwipeActionBar track={track} token={token} onNext={next} />
    </div>
  )
}
