import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/auth";
import { getUser } from "@/lib/server/store";

/**
 * Resolves the current session + user from a request's cookies, or returns
 * a 401 NextResponse. Every protected route handler starts with:
 *
 *   const auth = await requireAuth(req);
 *   if (auth instanceof NextResponse) return auth;
 *   const { user, session } = auth;
 *
 * Centralizing this means the "session expired" contract (401 + a
 * `{ error: "SESSION_EXPIRED" }` body) is identical everywhere, which is
 * what lets the client show one consistent "you've been signed out"
 * experience instead of bespoke handling per endpoint.
 */
export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json(
      { error: "SESSION_EXPIRED", message: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }
  const user = await getUser(session.userId);
  if (!user) {
    return NextResponse.json(
      { error: "SESSION_EXPIRED", message: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }
  return { user, session };
}

export function jsonError(status: number, error: string, message: string) {
  return NextResponse.json({ error, message }, { status });
}
