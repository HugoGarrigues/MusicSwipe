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
      case "tracks":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M9.75 3v10.5a3.75 3.75 0 1 0 1.5 2.925V8.625l7.5-2.25v7.125a3.75 3.75 0 1 0 1.5 2.925V3h-10.5Z"/>
          </svg>
        );
      case "settings":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
            <path d="M11.078 2.25c-.917 0-1.699.663-1.84 1.57l-.117.747a8.95 8.95 0 0 0-1.357.786l-.692-.4a1.875 1.875 0 0 0-2.545.682L2.98 7.08a1.875 1.875 0 0 0 .682 2.545l.692.4a8.959 8.959 0 0 0 0 1.571l-.692.4a1.875 1.875 0 0 0-.682 2.545l1.545 2.666c.52.897 1.67 1.205 2.545.682l.692-.4c.43.29.88.543 1.357.786l.117.747c.141.907.923 1.57 1.84 1.57h3.044c.917 0 1.699-.663 1.84-1.57l.117-.747c.477-.243.927-.496 1.357-.786l.692.4c.875.523 2.025.215 2.545-.682l1.545-2.666a1.875 1.875 0 0 0-.682-2.545l-.692-.4c.06-.52.06-1.051 0-1.571l.692-.4c.875-.523 1.205-1.67.682-2.545L20.02 5.135a1.875 1.875 0 0 0-2.545-.682l-.692.4a8.95 8.95 0 0 0-1.357-.786l-.117-.747a1.875 1.875 0 0 0-1.84-1.57h-3.044ZM12 15.375a3.375 3.375 0 1 1 0-6.75 3.375 3.375 0 0 1 0 6.75Z"/>
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
