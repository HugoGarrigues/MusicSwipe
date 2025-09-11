"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import RatingStars from "@/components/ui/RatingStars";
import { useEffect, useRef, useState } from "react";
import type { Track, RatingAverage } from "@/types";
import { get, post, del } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";
import { setDiscoverActions, setDiscoverState } from "@/store/discover";
import { Star, Heart, Plus, ExternalLink, SkipForward } from "lucide-react";

export default function MusicPage() {
  const { token } = useAuthContext();
  const [index, setIndex] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [avg, setAvg] = useState<RatingAverage | null>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [comment, setComment] = useState("");
  const sizeRef = useRef(25);
  const seenRef = useRef<Set<number>>(new Set());

  const track = tracks[index];

  useEffect(() => {
    // reset session window on auth change
    seenRef.current.clear();
    sizeRef.current = 25;
    (async () => {
      try {
        if (token) {
          const recents = await get<Track[]>(api.userRecentTracks(sizeRef.current), { token });
          if (recents?.length) {
            setTracks(recents);
            setIndex(0);
            return;
          }
          const list = await get<Track[]>(api.tracks(), { token });
          setTracks(list);
          setIndex(0);
        } else {
          const list = await get<Track[]>(api.tracks());
          setTracks(list);
          setIndex(0);
        }
      } catch {
        try {
          const list = await get<Track[]>(api.tracks(), token ? { token } : {});
          setTracks(list);
          setIndex(0);
        } catch { }
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
      } catch { }
    })();
  }, [track, token]);

  async function handleRate(v: number) {
    if (!token || !track) return alert("Connectez-vous");
    await post(api.ratings(), { trackId: track.id, score: v }, { token });
    const a = await get<RatingAverage>(api.ratingAverageByTrack(track.id), { token });
    setAvg(a);
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
      let filtered = (list ?? []).filter((t) => !seen.has(t.id));
      if (!filtered.length && token && sizeRef.current < 50) {
        sizeRef.current = Math.min(50, sizeRef.current + 10);
        const bigger = await get<Track[]>(api.userRecentTracks(sizeRef.current), { token });
        filtered = (bigger ?? []).filter((t) => !seen.has(t.id));
      }
      if (filtered.length) {
        filtered.forEach((t) => seen.add(t.id));
        setTracks(filtered);
        setIndex(0);
      } else {
        seen.clear();
        setTracks(list ?? []);
        setIndex(0);
      }
    } catch { }
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
    <div className="flex flex-col gap-4" >
      <div className="rounded-3xl p-5">
        <div className="grid grid-cols-1 gap-3">
          <GlassPanel hideHeader className="p-6 flex justify-center items-center">
            {track ? track.albumName ?? "" : ""}
          </GlassPanel>
        </div>
        <div className="flex flex-col items-center gap-3 mt-10">
          {track?.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              width={256}
              height={256}
              className="w-64 h-64 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-64 h-64 rounded-2xl bg-white/10" />
          )}
          <div className="text-lg font-semibold">{track?.title ?? "Chargement..."}</div>
          <div className="text-sm text-white/70">{track?.artistName ?? ""}</div>
          <RatingStars value={Math.round(avg?.average ?? 0)} onChange={handleRate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[["Album", track?.albumName ?? "-"], ["Artists", track?.artistName ?? "-"], ["Release Date", "-"], ["Duration", track?.duration ? `${track.duration}s` : "-"]].map(([k, v], i) => (
          <GlassPanel key={i} hideHeader className="p-3 text-sm">
            <div className="text-white/60">{k as string}</div>
            <div className="text-white/90">{v as string}</div>
          </GlassPanel>
        ))}
      </div>


      <div className="grid grid-cols-5 gap-3">
        {[Star, Heart, Plus, ExternalLink, SkipForward].map((Icon, i) => (
          <GlassPanel key={i} hideHeader className="aspect-square flex items-center justify-center">
            <Icon className="w-6 h-6 text-white/90" />
          </GlassPanel>
        ))}
      </div>

    </div>
  );
}