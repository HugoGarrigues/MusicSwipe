"use client";

import { useEffect, useState } from "react";

// Very lightweight auth state holder (token in localStorage).
// Adapt this later to your real OAuth flow.
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("ms_token");
    if (t) setToken(t);
  }, []);

  function saveToken(t: string) {
    localStorage.setItem("ms_token", t);
    setToken(t);
  }
  function clearToken() {
    localStorage.removeItem("ms_token");
    setToken(null);
  }

  return { token, saveToken, clearToken, isAuthenticated: !!token } as const;
}

