import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (pathname === "/favicon.ico") return true;
  // static files like /icon.png
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const isAuthenticated = Boolean(token);

  // If user is authenticated and visits auth pages, send them home
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Protect all non-public paths
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // preserve original destination for post-login redirect
    const next = encodeURIComponent(pathname + (search || ""));
    url.search = `?next=${next}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except internal Next/static assets and common public files
    "/((?!_next/static|_next/image|favicon.ico|assets/.*|manifest.webmanifest|robots.txt|sitemap.xml|sw.js|service-worker.js).*)",
  ],
};

