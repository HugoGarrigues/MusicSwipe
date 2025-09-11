"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TABS, TabIcon } from "@/config/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import RatingStars from "@/components/ui/RatingStars";
import { getDiscoverActions, getDiscoverState, subscribeDiscover } from "@/store/discover";
import { Star, Heart, Plus, ExternalLink, SkipForward, Home as HomeIcon, Music as MusicIcon, User as UserIcon } from "lucide-react";

function Icon({ name, active }: { name: TabIcon; active: boolean }) {
  const cls = active ? "opacity-100" : "opacity-75";
  const common = `w-5 h-5 ${cls}`;
  switch (name) {
    case "home":
      return <HomeIcon className={common} />;
    case "music":
      return <MusicIcon className={common} />;
    case "account":
      return <UserIcon className={common} />;
  }
}

export default function BottomNav() {
  const pathname = usePathname();
  const onMusic = !!pathname?.startsWith("/music");

  const router = useRouter();
  const [track, setTrack] = useState(getDiscoverState().track);
  const [liked, setLiked] = useState(getDiscoverState().liked);
  const [showRating, setShowRating] = useState(false);
  const actions = getDiscoverActions();

  useEffect(() => {
    return subscribeDiscover((s) => {
      setTrack(s.track);
      setLiked(s.liked);
    });
  }, []);

  return (
    <nav className="fixed bottom-3 left-0 right-0 mx-auto max-w-md px-4">
      {onMusic ? (
        <>
          {showRating && (
            <GlassPanel className="mb-2 p-3">
              <div className="text-center text-xs text-white/70 mb-2">Noter ce titre</div>
              <div className="flex justify-center">
                <RatingStars value={0} onChange={(v) => { setShowRating(false); actions.rate?.(v); }} />
              </div>
            </GlassPanel>
          )}
          <div className="grid grid-cols-5 gap-2 mb-2">
            <GlassPanel hideHeader className="aspect-square flex items-center justify-center">
              <button aria-label="Noter" onClick={() => setShowRating((v) => !v)}>
                <Star className="w-6 h-6 text-white/90" />
              </button>
            </GlassPanel>
            <GlassPanel hideHeader className="aspect-square flex items-center justify-center">
              <button aria-label="Like" onClick={() => actions.toggleLike?.()}>
                <Heart className={liked ? "w-6 h-6 text-pink-400" : "w-6 h-6 text-white/90"} />
              </button>
            </GlassPanel>
            <GlassPanel hideHeader className="aspect-square flex items-center justify-center">
              <button aria-label="Voir le son" onClick={() => track && router.push(`/tracks/${track.id}`)}>
                <Plus className="w-6 h-6 text-white/90" />
              </button>
            </GlassPanel>
            <GlassPanel hideHeader className="aspect-square flex items-center justify-center">
              <button aria-label="Ouvrir sur Spotify" onClick={() => track?.spotifyId && window.open(`https://open.spotify.com/track/${track.spotifyId}`, "_blank")}>
                <ExternalLink className="w-6 h-6 text-white/90" />
              </button>
            </GlassPanel>
            <GlassPanel hideHeader className="aspect-square flex items-center justify-center">
              <button aria-label="Suivant" onClick={() => actions.next?.()}>
                <SkipForward className="w-6 h-6 text-white/90" />
              </button>
            </GlassPanel>
          </div>
        </>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
        <ul className="grid grid-cols-3 gap-1 p-2">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
            return (
              <li key={tab.href} className="flex">
                <Link
                  href={tab.href}
                  className={`flex-1 rounded-xl px-3 py-2 text-center text-xs transition-colors ${active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"}`}
                  prefetch
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon name={tab.icon} active={!!active} />
                    <span>{tab.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}