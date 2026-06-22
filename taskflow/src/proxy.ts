import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/auth";

const PUBLIC_PAGES = new Set(["/login"]);

/**
 * Next.js 16 renamed the middleware.ts convention to proxy.ts (same
 * behavior, runs before any matched route renders, always on the Node.js
 * runtime now). Route protection lives here rather than per-page, so
 * "restrict access to authenticated areas" is enforced once, rather than
 * relying on every page remembering to check. /public/* and /login are
 * excluded via the matcher below so they never hit this check at all —
 * public board pages must render with zero auth dependency, matching the
 * "no login required" requirement.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)"],
};
