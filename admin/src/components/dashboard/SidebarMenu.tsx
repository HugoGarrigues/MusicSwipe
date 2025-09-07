"use client";

import Link from "next/link";
import { SIDEBAR_ITEMS } from "@/config/navigation";

export const SidebarMenu: React.FC = () => {
  const items = SIDEBAR_ITEMS;

  const renderIcon = (name: typeof items[number]["icon"]) => {
    const cls = "h-4 w-4";
    switch (name) {
      case "dashboard":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M3.75 3A.75.75 0 0 0 3 3.75v4.5A.75.75 0 0 0 3.75 9h4.5A.75.75 0 0 0 9 8.25v-4.5A.75.75 0 0 0 8.25 3h-4.5Z"/>
            <path d="M14.25 3A.75.75 0 0 0 13.5 3.75v7.5a.75.75 0 0 0 .75.75h5.25a.75.75 0 0 0 .75-.75v-7.5A.75.75 0 0 0 19.5 3h-5.25Z"/>
            <path d="M3.75 13.5A.75.75 0 0 0 3 14.25v6a.75.75 0 0 0 .75.75h6a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75h-6Z"/>
            <path d="M13.5 15.75a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-5.25a.75.75 0 0 1-.75-.75v-4.5Z"/>
          </svg>
        );
      case "users":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M7.5 6.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"/>
            <path d="M2.25 19.5a6.75 6.75 0 1 1 13.5 0v.75H2.25v-.75Z"/>
            <path d="M17.25 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"/>
            <path d="M18.75 12.75a5.25 5.25 0 0 1 3 4.725v.775H16.5v-.775a6.72 6.72 0 0 0-1.23-3.84 6.72 6.72 0 0 1 3.48-.885h0Z"/>
          </svg>
        );
      case "comments":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 3V6A1.5 1.5 0 0 1 4.5 4.5Z"/>
          </svg>
        );
      case "likes":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M11.645 20.91 3.61 12.875a5.25 5.25 0 1 1 7.424-7.425l.966.966.966-.966a5.25 5.25 0 0 1 7.424 7.425L12.355 20.91a.5.5 0 0 1-.71 0Z"/>
          </svg>
        );
      case "ratings":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M11.48 3.499a.75.75 0 0 1 1.04 0l2.125 2.01a.75.75 0 0 0 .53.22h2.35a.75.75 0 0 1 .42 1.34l-1.9 1.8a.75.75 0 0 0-.22.53v2.35a.75.75 0 0 1-1.34.42l-1.8-1.9a.75.75 0 0 0-.53-.22h-2.35a.75.75 0 0 1-.42-1.34l1.9-1.8a.75.75 0 0 0 .22-.53v-2.35a.75.75 0 0 1 .42-1.34l2.125-2.01Z"/>
            <path d="M4.5 10.5a7.5 7.5 0 1 1 15 0v3a7.5 7.5 0 0 1-15 0v-3Z"/>
          </svg>
        );
      case "tracks":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M12 3.75a8.25 8.25 0 1 1 0 16.5 8.25 8.25 0 0 1 0-16.5ZM10.5 6a1.5 1.5 0 1 0 0 3h7.5a1.5 1.5 0 1 0 0-3h-7.5ZM6.75 12a1.5 1.5 0 1 0 0 3h10.5a1.5 1.5 0 1 0 0-3H6.75ZM9.75 17.25a1.5 1.5 0 1 0 0 3h4.5a1.5 1.5 0 1 0 0-3h-4.5Z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="flex flex-col gap-5 h-full">
      <div className="px-3 py-2 text-white font-semibold text-center text-xl">MusicSwipe</div>
      <div className="flex flex-col gap-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group inline-flex items-center gap-3 rounded-lg px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition text-white no-underline hover:no-underline"
          >
            <span className="opacity-80 group-hover:opacity-100">{renderIcon(it.icon)}</span>
            <span className="text-sm text-white/90 group-hover:text-white">{it.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <button
          className="w-full h-9 px-3 rounded-md inline-flex items-center justify-center gap-2 bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/30 backdrop-blur-md transition"
          onClick={() => {
            try {
              localStorage.removeItem("token");
            } catch {}
            document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
            window.location.href = "/login";
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};
