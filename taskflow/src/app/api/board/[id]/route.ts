import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/server/api-helpers";
import { getBoard, isWorkspaceMember } from "@/lib/server/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const board = await getBoard(id);
  if (!board) {
    return jsonError(404, "NOT_FOUND", "Board not found.");
  }

  const isMember = await isWorkspaceMember(board.workspaceId, auth.user.id);
  if (!isMember) {
    return jsonError(403, "FORBIDDEN", "You don't have access to this board.");
  }

  return NextResponse.json({ board });
}
