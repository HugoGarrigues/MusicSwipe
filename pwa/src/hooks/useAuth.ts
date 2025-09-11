"use client";

import { useEffect, useState } from "react";

// Lightweight auth state holder
// - Persists token in localStorage AND a cookie (for future middleware/server needs)
// - Exposes a `ready` flag once initial token load has happened
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("ms_token");
      if (t) setToken(t);
    } finally {
      setReady(true);
    }
  }, []);

  function saveToken(t: string) {
    try {
      localStorage.setItem("ms_token", t);
    } catch {}
    try {
      document.cookie = `ms_token=${encodeURIComponent(t)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } catch {}
    setToken(t);
  }

  function clearToken() {
    try {
      localStorage.removeItem("ms_token");
    } catch {}
    try {
      // Expire cookie immediately
      document.cookie = `ms_token=; Path=/; Max-Age=0; SameSite=Lax`;
    } catch {}
    setToken(null);
  }

  return { token, saveToken, clearToken, isAuthenticated: !!token, ready } as const;
}
