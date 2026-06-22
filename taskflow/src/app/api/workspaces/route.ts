import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/api-helpers";
import { getWorkspacesForUser } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const workspaces = await getWorkspacesForUser(auth.user.id);
  return NextResponse.json({ workspaces });
}
