import { NextResponse, NextRequest } from "next/server";

const ADMIN_ONLY_PATHS: RegExp[] = [
  /^\/$/,
  /^\/users/,
  /^\/tracks/,
  /^\/comments/,
  /^\/ratings/,
  /^\/follows/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public access to login
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verify role with backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // middleware runs on the edge; no caching of auth
      cache: "no-store",
    });
    if (!res.ok) throw new Error("unauthorized");
    const me = await res.json();
    if (!me?.isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "not_admin");
      return NextResponse.redirect(url);
    }
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};


