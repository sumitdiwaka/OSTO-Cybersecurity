import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/server/auth";

/**
 * Dev/demo-only endpoint: forcibly invalidates the current session cookie
 * by overwriting it with garbage, so "session expiration" (a required
 * feature) can be demonstrated on demand instead of requiring a reviewer
 * to wait out the real TTL. Wired to a "Simulate expired session" button
 * in the navbar. Not something a production app would ship.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "expired.token", { path: "/", maxAge: 60 * 60 });
  return res;
}
