"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  saveToken: (t: string) => void;
  clearToken: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const value = useMemo(
    () => ({ token: auth.token, isAuthenticated: auth.isAuthenticated, saveToken: auth.saveToken, clearToken: auth.clearToken, ready: auth.ready }),
    [auth.token, auth.isAuthenticated, auth.saveToken, auth.clearToken, auth.ready]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
