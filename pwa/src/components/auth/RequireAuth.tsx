"use client";

import React, { useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return; // wait until token is loaded
    if (!isAuthenticated) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [isAuthenticated, ready, router, pathname]);

  if (!ready) {
    // Avoid flashing content while we determine auth state
    return null;
  }
  if (!isAuthenticated) return null; // will be redirected
  return <>{children}</>;
}

