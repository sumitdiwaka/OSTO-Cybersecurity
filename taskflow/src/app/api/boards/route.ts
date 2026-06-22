import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/server/api-helpers";
import { getBoardsForWorkspace, isWorkspaceMember } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return jsonError(400, "INVALID_INPUT", "workspaceId query param is required.");
  }

  const isMember = await isWorkspaceMember(workspaceId, auth.user.id);
  if (!isMember) {
    return jsonError(403, "FORBIDDEN", "You don't have access to this workspace.");
  }

  const boards = await getBoardsForWorkspace(workspaceId);
  return NextResponse.json({ boards });
}
