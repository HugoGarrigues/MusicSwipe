export type SidebarIcon = "dashboard" | "users" | "tracks" | "settings";

export type SidebarItem = {
  href: string;
  label: string;
  icon: SidebarIcon;
};

export const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/users", label: "Utilisateurs", icon: "users" },
  { href: "/tracks", label: "Titres", icon: "tracks" },
  { href: "/settings", label: "Paramètres", icon: "settings" },
] as const;
