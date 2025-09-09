import React from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import UserAvatar from "@/components/user/UserAvatar";

export default function HeaderBar({ title = "HGRS", subtitle = "Qu’avez vous écouté récemment ?" }: { title?: string; subtitle?: string }) {
  return (
    <div className="pt-3 pb-4">
      <GlassPanel hideHeader className="p-3">
        <div className="flex items-center gap-3">
          <UserAvatar size={36} />
          <div className="flex flex-col">
            <div className="text-white font-semibold">{title}</div>
            <div className="text-white/70 text-sm">{subtitle}</div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

