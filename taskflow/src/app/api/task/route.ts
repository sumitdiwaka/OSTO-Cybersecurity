import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/server/api-helpers";
import { createTask, getBoardMeta, isWorkspaceMember } from "@/lib/server/store";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const boardId = typeof body?.boardId === "string" ? body.boardId : "";
  const columnId = typeof body?.columnId === "string" ? body.columnId : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!boardId || !columnId || !title) {
    return jsonError(400, "INVALID_INPUT", "boardId, columnId and title are required.");
  }

  const board = await getBoardMeta(boardId);
  if (!board) return jsonError(404, "NOT_FOUND", "Board not found.");

  const isMember = await isWorkspaceMember(board.workspaceId, auth.user.id);
  if (!isMember) return jsonError(403, "FORBIDDEN", "You don't have access to this board.");

  const task = await createTask({
    boardId,
    columnId,
    title,
    description: typeof body?.description === "string" ? body.description : "",
    priority: ["low", "medium", "high"].includes(body?.priority) ? body.priority : "medium",
    assigneeId: typeof body?.assigneeId === "string" ? body.assigneeId : null,
    actorId: auth.user.id,
  });

  return NextResponse.json({ task }, { status: 201 });
}
