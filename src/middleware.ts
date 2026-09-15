import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Deliberately does NOT import `@/auth` (which pulls in the Prisma-backed
// adapter) -- this file runs on the Edge runtime (Next 16 moved the
// nodejs-only replacement to proxy.ts, but Netlify's Next.js adapter
// doesn't yet support that convention: it broke outright in production,
// "nextHandler is not a function", when this was a proxy.ts importing
// @/auth). Edge can't run Node-only Postgres drivers, and our session
// strategy is "database" (not JWT), so there's no self-contained token to
// verify without a DB round trip anyway. This does the "optimistic" check
// Auth.js's own docs recommend for exactly this combination: cookie
// presence only, not full validation. A stale/invalid cookie that slips
// through still gets caught by the real `auth()` call every page already
// makes (that one *can* hit the database, since pages run on the Node.js
// runtime as ordinary serverless functions, not edge).
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

function hasSessionCookie(req: NextRequest) {
  return SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
}

export default function middleware(req: NextRequest) {
  const isAuthed = hasSessionCookie(req);
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return NextResponse.next();

  if (!isAuthed && !isAuthRoute) {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
