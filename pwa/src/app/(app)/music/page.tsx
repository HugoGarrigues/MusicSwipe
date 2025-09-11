"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import RatingStars from "@/components/ui/RatingStars";
import { useEffect, useRef, useState } from "react";
import type { Track, RatingAverage, Rating, User } from "@/types";
import { get, post, del } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import { setDiscoverActions, setDiscoverState } from "@/store/discover";
import Image from "next/image";

export default function MusicPage() {
  const { token } = useAuthContext();
  const [index, setIndex] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [avg, setAvg] = useState<RatingAverage | null>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [comment, setComment] = useState("");
  const sizeRef = useRef(25);
  const seenRef = useRef<Set<number>>(new Set());
  const ratedRef = useRef<Set<number>>(new Set());

  const track = tracks[index];

  useEffect(() => {
    // reset session window on auth change
    seenRef.current.clear();
    sizeRef.current = 25;
    ratedRef.current.clear();
    (async () => {
      try {
        if (token) {
          // Load user's rated tracks to filter them out
          try {
            const me = await get<User>(api.me(), { token });
            const rs = await get<Rating[]>(`${api.ratings()}?userId=${me.id}`, { token }).catch(() => []);
            ratedRef.current = new Set((rs ?? []).map((r) => r.trackId));
          } catch {}

          // Try recent tracks first, then fallback to all tracks
          const recents = await get<Track[]>(api.userRecentTracks(sizeRef.current), { token });
          if (recents?.length) {
            const filtered = recents.filter((t) => !ratedRef.current.has(t.id));
            setTracks(filtered);
            setIndex(0);
            return;
          }
          const list = await get<Track[]>(api.tracks(), { token });
          const filtered = (list ?? []).filter((t) => !ratedRef.current.has(t.id));
          setTracks(filtered);
          setIndex(0);
        } else {
          const list = await get<Track[]>(api.tracks());
          setTracks(list);
          setIndex(0);
        }
      } catch {
        try {
          const list = await get<Track[]>(api.tracks(), token ? { token } : {});
          const filtered = token ? (list ?? []).filter((t) => !ratedRef.current.has(t.id)) : list;
          setTracks(filtered ?? []);
          setIndex(0);
        } catch {}
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!track) return;
    (async () => {
      try {
        const a = token ? await get<RatingAverage>(api.ratingAverageByTrack(track.id), { token }) : null;
        setAvg(a);
        if (token) {
          const s = await get<{ liked: boolean }>(api.likeStatusByTrack(track.id), { token });
          setLiked(!!s?.liked);
        } else setLiked(false);
      } catch {}
    })();
  }, [track, token]);

  async function handleRate(v: number) {
    if (!token || !track) return alert("Connectez-vous");
    await post(api.ratings(), { trackId: track.id, score: v }, { token });
    const a = await get<RatingAverage>(api.ratingAverageByTrack(track.id), { token });
    setAvg(a);
    // Mark as rated locally and remove from current list
    ratedRef.current.add(track.id);
    const currentId = track.id;
    const currentIndex = index;
    // Prune the rated track from the list and keep pointer on the next one
    setTracks((prev) => {
      const nextList = prev.filter((t) => t.id !== currentId);
      if (!nextList.length) {
        // No more tracks locally, try to reload a bigger window
        reloadTracks(true);
      } else {
        // Keep index pointing to the same position which is now the next track
        setIndex(Math.min(currentIndex, nextList.length - 1));
      }
      return nextList;
    });
  }

  async function toggleLike() {
    if (!token || !track) return alert("Connectez-vous");
    if (liked) await del(api.unlikeTrack(track.id), { token });
    else await post(api.likeTrack(), { trackId: track.id }, { token });
    const s = await get<{ liked: boolean }>(api.likeStatusByTrack(track.id), { token });
    setLiked(!!s?.liked);
  }

  // Expose current track + actions to BottomNav
  useEffect(() => {
    setDiscoverState({ track: track ?? null, liked });
    setDiscoverActions({
      prev,
      next,
      toggleLike: async () => { await toggleLike(); },
      rate: async (score: number) => { await handleRate(score); },
    });
    return () => { setDiscoverState({ track: null }); };
  }, [track, liked]);

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
      let filtered = (list ?? []).filter((t) => !seen.has(t.id) && !ratedRef.current.has(t.id));
      if (!filtered.length && token && sizeRef.current < 500) {
        sizeRef.current = Math.min(50, sizeRef.current + 10);
        const bigger = await get<Track[]>(api.userRecentTracks(sizeRef.current), { token });
        filtered = (bigger ?? []).filter((t) => !seen.has(t.id) && !ratedRef.current.has(t.id));
      }
      if (filtered.length) {
        filtered.forEach((t) => seen.add(t.id));
        setTracks(filtered);
        setIndex(0);
      } else {
        seen.clear();
        const filteredAll = (list ?? []).filter((t) => !ratedRef.current.has(t.id));
        setTracks(filteredAll);
        setIndex(0);
      }
    } catch {}
  }

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
  function prev() { setIndex((i) => Math.max(i - 1, 0)); }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl p-5">
        <div className="grid grid-cols-1 gap-3 mt-15">
          <GlassPanel hideHeader className="p-6 flex justify-center items-center font-semibold">
            {track ? track.albumName ?? "" : ""}
          </GlassPanel>
        </div>
        <div className="min-h-[60dvh] grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            {track?.coverUrl ? (
              <Image
                src={track.coverUrl}
                alt={track.title}
                width={384}
                height={384}
                quality={90}
                unoptimized
                className="w-80 h-80 sm:w-96 sm:h-96 rounded-3xl object-cover shadow-lg shadow-black/30 ring-1 ring-white/10"
              />
            ) : (
              <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-3xl bg-white/10" />
            )}
            <div className="text-lg font-semibold text-center">{track?.title ?? "Chargement..."}</div>
            <div className="text-sm text-white/70 text-center">{track?.artistName ?? ""}</div>
            <RatingStars value={Math.round(avg?.average ?? 0)} onChange={handleRate} />
          </div>
        </div>
      </div>
    </div>
  );
}
