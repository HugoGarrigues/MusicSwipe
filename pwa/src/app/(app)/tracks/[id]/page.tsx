"use client";

import Card from "@/components/ui/Card";
import RatingStars from "@/components/ui/RatingStars";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/config/api";
import { get, post } from "@/lib/http";
import { useEffect, useMemo, useState } from "react";
import type { Track, Rating, RatingAverage } from "@/types";
import Image from "next/image";
import { ArrowLeft, MoreVertical, Star } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { params: { id: string } };

export default function TrackDetailPage({ params }: Props) {
  const id = Number(params.id);
  const router = useRouter();
  const { token } = useAuthContext();

  const [track, setTrack] = useState<Track | null>(null);
  const [avg, setAvg] = useState<RatingAverage | null>(null);
  const [ratings, setRatings] = useState<Rating[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshRatings() {
    if (!token) { setRatings(null); setAvg(null); return; }
    try {
      const [a, rs] = await Promise.all([
        get<RatingAverage>(api.ratingAverageByTrack(id), { token }),
        get<Rating[]>(`${api.ratings()}?trackId=${id}`, { token }),
      ]);
      setAvg(a);
      setRatings(rs);
    } catch {}
  }

  useEffect(() => {
    (async () => {
      try {
        const t = await get<Track>(api.track(id), token ? { token } : {});
        setTrack(t);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur";
        setError(message);
      }
    })();
  }, [id, token]);

  useEffect(() => { refreshRatings(); }, [id, token]);

  const dist = useMemo(() => {
    const d = [0,0,0,0,0];
    for (const r of ratings ?? []) { if (r.score>=1 && r.score<=5) d[r.score-1]++; }
    return d;
  }, [ratings]);

  async function handleRate(v: number) {
    if (!token) return alert("Connectez-vous pour noter");
    try {
      await post(api.ratings(), { trackId: id, score: v }, { token });
      await refreshRatings();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur rating";
      alert(message);
    }
  }

  function formatDuration(sec?: number | null) {
    if (!sec && sec !== 0) return "—";
    const s = Math.max(0, Math.round(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center justify-between px-1 pt-2">
        <button aria-label="Retour" onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button aria-label="Plus" className="p-2 -mr-2">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      {error && <Card className="p-3 text-red-400">{error}</Card>}
      {!track && <Card className="p-3 text-white/70">Chargement…</Card>}
      {track && (
        <>
          <div className="flex flex-col items-center gap-3 mt-1">
            {track.coverUrl ? (
              <Image src={track.coverUrl} alt={track.title} width={280} height={280} className="w-72 h-72 rounded-2xl object-cover" unoptimized />
            ) : (
              <div className="w-72 h-72 rounded-2xl bg-white/10" />
            )}
            <div className="text-xl font-semibold">{track.title}</div>
            <div className="text-sm text-white/70">{track.artistName ?? "—"}</div>
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <RatingStars value={Math.round(avg?.average ?? 0)} onChange={handleRate} />
            </div>
          </div>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-white/40" />
              <div className="flex-1 h-24 flex items-end gap-2">
                {dist.map((v, i) => {
                  const max = Math.max(1, ...dist);
                  const h = Math.round((v / max) * 96);
                  return <div key={i} className="w-6 bg-sky-400 rounded-t" style={{ height: `${h}px` }} />;
                })}
              </div>
              <div className="text-xl font-semibold w-10 text-right">{avg ? avg.average.toFixed(1) : "—"}</div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={(avg && i < Math.round(avg.average) ? "fill-sky-400 text-sky-400" : "text-white/30") + " w-3.5 h-3.5"} />
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-white/10">
              <div className="p-3">
                <div className="text-xs text-white/60">Album</div>
                <div className="text-sm">{track.albumName ?? "—"}</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-white/60">Artists</div>
                <div className="text-sm">{track.artistName ?? "—"}</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-white/60">Duration</div>
                <div className="text-sm">{formatDuration(track.duration ?? undefined)}</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
