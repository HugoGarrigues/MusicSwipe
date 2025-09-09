"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RatingStars from "@/components/ui/RatingStars";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/config/api";
import { get, post, del } from "@/lib/http";
import { useEffect, useState } from "react";
import type { Track, Comment, RatingAverage } from "@/types";

type Props = { params: { id: string } };

export default function TrackDetailPage({ params }: Props) {
  const id = Number(params.id);
  const { token } = useAuthContext();

  const [track, setTrack] = useState<Track | null>(null);
  const [avg, setAvg] = useState<RatingAverage | null>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, a] = await Promise.all([
          get<Track>(api.track(id)),
          get<RatingAverage>(api.ratingAverageByTrack(id), token ? { token } : {}),
        ]);
        setTrack(t);
        setAvg(a);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur";
        setError(message);
      }
    })();
  }, [id, token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [s, cs] = await Promise.all([
          get<{ trackId: number; liked: boolean }>(api.likeStatusByTrack(id), { token }),
          get<Comment[]>(api.commentsByTrack(id), { token }),
        ]);
        setLiked(!!s?.liked);
        setComments(cs);
      } catch {}
    })();
  }, [id, token]);

  async function toggleLike() {
    if (!token) return alert("Connectez-vous pour liker");
    try {
      if (liked) await del(api.unlikeTrack(id), { token });
      else await post(api.likeTrack(), { trackId: id }, { token });
      const s = await get<{ trackId: number; liked: boolean }>(api.likeStatusByTrack(id), { token });
      setLiked(!!s?.liked);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur like";
      alert(message);
    }
  }

  async function handleRate(v: number) {
    if (!token) return alert("Connectez-vous pour noter");
    try {
      await post(api.ratings(), { trackId: id, score: v }, { token });
      const a = await get<{ trackId: number; average: number; count: number }>(api.ratingAverageByTrack(id), { token });
      setAvg(a);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur rating";
      alert(message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Card className="p-3 text-red-400">{error}</Card>}
      {!track && <Card className="p-3 text-white/70">Chargement…</Card>}
      {track && (
        <>
          <h1 className="text-xl font-semibold">{track.title}</h1>
          <Card className="p-4">
            <div className="text-base font-semibold">{track.title}</div>
            <div className="text-sm text-white/70">{track.artistName ?? "Artiste inconnu"}</div>
            <div className="mt-3 flex items-center gap-3">
              <RatingStars value={Math.round(avg?.average ?? 0)} onChange={handleRate} />
              {avg && <div className="text-sm text-white/70">{avg.average.toFixed(1)} ({avg.count})</div>}
            </div>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleLike}>{liked ? "💔 Unlike" : "❤️ Like"}</Button>
          </div>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Commentaires</h2>
            {comments?.length ? (
              <Card className="divide-y divide-white/5">
                {comments.map((c) => (
                  <div key={c.id} className="p-3">
                    <div className="text-sm">{c.content}</div>
                    <div className="text-xs text-white/50">#{c.id}</div>
                  </div>
                ))}
              </Card>
            ) : (
              <Card className="p-3 text-white/70">Aucun commentaire pour le moment</Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
