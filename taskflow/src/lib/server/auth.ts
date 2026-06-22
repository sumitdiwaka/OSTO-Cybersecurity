import "server-only";
import type { Session } from "@/lib/types";

/**
 * Mock auth. This is NOT a real auth system — there's no real password
 * hashing and the "JWT" below is a hand-rolled signed token, not an actual
 * JWT library. That's a deliberate scope cut: the assignment asks for a
 * basic login flow with session handling, not a production auth system.
 * See ENGINEERING_NOTES.md for what a real implementation would swap in
 * (e.g. NextAuth/Auth.js, bcrypt, httpOnly+secure refresh tokens).
 *
 * Uses Web Crypto (crypto.subtle) rather than Node's `crypto` module so
 * the exact same code runs in both the Node.js API routes and the
 * Edge-compatible middleware that guards protected pages.
 */

export const SESSION_COOKIE = "taskflow_session";

// Configurable so session expiry can be demoed quickly without waiting.
// Defaults to 30 minutes; override with SESSION_TTL_MS, e.g. 60000 for 1 min.
export const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS ?? 30 * 60 * 1000);

const SECRET = process.env.SESSION_SECRET ?? "taskflow-dev-secret-do-not-use-in-prod";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(sig));
}

export async function createSessionToken(userId: string): Promise<string> {
  const now = Date.now();
  const session: Session = { userId, issuedAt: now, expiresAt: now + SESSION_TTL_MS };
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await sign(payload);
  if (expected.length !== signature.length || expected !== signature) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as Session;
    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}
