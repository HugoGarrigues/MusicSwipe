"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import RatingStars from "@/components/ui/RatingStars";
import RatingHistogram from "@/components/ui/RatingHistogram";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import type { Track, RatingAverage } from "@/types";
import { get, post, del } from "@/lib/http";
import { api } from "@/config/api";
import { useAuthContext } from "@/providers/AuthProvider";

export default function MusicPage() {
  const { token } = useAuthContext();
  const [index, setIndex] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [avg, setAvg] = useState<RatingAverage | null>(null);
  const [liked, setLiked] = useState<boolean>(false);

  const track = tracks[index];

  useEffect(() => {
    (async () => {
      const list = await get<Track[]>(api.tracks());
      setTracks(list);
      setIndex(0);
    })();
  }, []);

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
  }

  async function toggleLike() {
    if (!token || !track) return alert("Connectez-vous");
    if (liked) await del(api.unlikeTrack(track.id), { token });
    else await post(api.likeTrack(), { trackId: track.id }, { token });
    const s = await get<{ liked: boolean }>(api.likeStatusByTrack(track.id), { token });
    setLiked(!!s?.liked);
  }

  function next() { setIndex((i) => Math.min(i + 1, Math.max(tracks.length - 1, 0))); }
  function prev() { setIndex((i) => Math.max(i - 1, 0)); }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="rounded-3xl p-5" style={{ background: "linear-gradient(160deg, #3b0764 0%, #0b0b0f 70%)" }}>
        <div className="text-center text-white/80 text-xs mb-3">{track ? track.albumName ?? "" : ""}</div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-64 h-64 rounded-2xl bg-white/10" />
          <div className="text-lg font-semibold">{track?.title ?? "Chargement…"}</div>
          <div className="text-sm text-white/70">{track?.artistName ?? ""}</div>
          <RatingStars value={Math.round(avg?.average ?? 0)} onChange={handleRate} />
          <div className="flex items-center gap-2">
            <RatingHistogram bars={[1,2,3,4,8,12,8,6,5,2]} count={avg?.average ?? 0} />
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={prev}>◀</Button>
            <Button variant="outline" onClick={toggleLike}>{liked ? "💔" : "❤️"}</Button>
            <Button variant="outline" onClick={next}>▶</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[["Album", track?.albumName ?? "—"], ["Artists", track?.artistName ?? "—"], ["Release Date", "—"], ["Duration", track?.duration ? `${track.duration}s` : "—"]].map(([k, v], i) => (
          <GlassPanel key={i} hideHeader className="p-3 text-sm">
            <div className="text-white/60">{k as string}</div>
            <div className="text-white/90">{v as string}</div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
