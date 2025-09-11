import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Track } from "@/types";

export default function TrackCard({ track, onLike }: { track: Track; onLike?: (t: Track) => void }) {
  return (
    <Card className="p-4 flex gap-4">
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          width={64}
          height={64}
          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-16 h-16 rounded-md bg-white/10 flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className="text-base font-semibold">{track.title}</div>
        <div className="text-sm text-white/70">{track.artistName ?? "Artiste inconnu"}</div>
        {track.albumName && <div className="text-xs text-white/50 mt-1">{track.albumName}</div>}
        {track.previewUrl && (
          <audio className="mt-3 w-full" src={track.previewUrl} controls preload="none" />
        )}
      </div>
      {onLike && (
        <div className="flex items-start">
          <Button variant="ghost" aria-label="Like" onClick={() => onLike(track)}>
            ❤️
          </Button>
        </div>
      )}
    </Card>
  );
}

