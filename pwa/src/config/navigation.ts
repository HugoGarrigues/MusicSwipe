export type TabIcon = "home" | "music" | "account";

export type TabItem = {
  href: string;
  label: string;
  icon: TabIcon;
};

export const TABS: readonly TabItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/music", label: "Music", icon: "music" },
  { href: "/account", label: "Account", icon: "account" },
] as const;
