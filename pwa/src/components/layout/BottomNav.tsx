"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, TabIcon } from "@/config/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
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

  return (
    <nav className="fixed bottom-3 left-0 right-0 mx-auto max-w-md px-4">
      {onMusic ? (
        <div className="grid grid-cols-5 gap-2 mb-2">
          {[Star, Heart, Plus, ExternalLink, SkipForward].map((IconCmp, i) => (
            <GlassPanel key={i} hideHeader className="aspect-square flex items-center justify-center">
              <IconCmp className="w-6 h-6 text-white/90" />
            </GlassPanel>
          ))}
        </div>
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