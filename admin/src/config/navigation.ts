export type SidebarIcon = "dashboard" | "users" | "tracks" | "comments" | "likes" | "ratings";

export type SidebarItem = {
  href: string;
  label: string;
  icon: SidebarIcon;
};

export const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/users", label: "Utilisateurs", icon: "users" },
  { href: "/tracks", label: "Titres", icon: "tracks" },
  { href: "/comments", label: "Commentaires", icon: "comments" },
  { href: "/likes", label: "Likes", icon: "likes" },
  { href: "/ratings", label: "Notes", icon: "ratings" },
] as const;

