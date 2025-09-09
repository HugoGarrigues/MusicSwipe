"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, TabIcon } from "@/config/navigation";

function Icon({ name, active }: { name: TabIcon; active: boolean }) {
  const cls = active ? "opacity-100" : "opacity-75";
  switch (name) {
    case "home":
      return (
        <svg aria-hidden viewBox="0 0 24 24" className={`w-5 h-5 ${cls}`}>
          <path fill="currentColor" d="M12 3 3 10v10a1 1 0 0 0 1 1h6v-6h4v6h6a1 1 0 0 0 1-1V10l-9-7Z"/>
        </svg>
      );
    case "music":
      return (
        <svg aria-hidden viewBox="0 0 24 24" className={`w-5 h-5 ${cls}`}>
          <path fill="currentColor" d="M12 3v10.55a4 4 0 1 1-2-3.45V6h8V3h-6Z"/>
        </svg>
      );
    case "account":
      return (
        <svg aria-hidden viewBox="0 0 24 24" className={`w-5 h-5 ${cls}`}>
          <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/>
        </svg>
      );
  }
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-0 right-0 mx-auto max-w-md px-4">
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
