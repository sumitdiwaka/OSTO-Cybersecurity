import { NextRequest, NextResponse } from "next/server";
import { checkPassword, findUserByEmail } from "@/lib/server/store";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/api-helpers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonError(400, "INVALID_INPUT", "Email and password are required.");
  }

  const user = await findUserByEmail(email);
  if (!user || !checkPassword(email, password)) {
    return jsonError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const token = await createSessionToken(user.id);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return res;
}
