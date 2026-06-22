import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/server/api-helpers";
import { deleteTask, getBoardMeta, getTaskMeta, isWorkspaceMember, updateTask } from "@/lib/server/store";

async function checkAccess(req: NextRequest, taskId: string) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const task = await getTaskMeta(taskId);
  if (!task) return jsonError(404, "NOT_FOUND", "Task not found.");

  const board = await getBoardMeta(task.boardId);
  if (!board) return jsonError(404, "NOT_FOUND", "Board not found.");

  const isMember = await isWorkspaceMember(board.workspaceId, auth.user.id);
  if (!isMember) return jsonError(403, "FORBIDDEN", "You don't have access to this task.");

  return { user: auth.user };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(req, id);
  if (access instanceof NextResponse) return access;

  const body = await req.json().catch(() => null);
  if (!body) return jsonError(400, "INVALID_INPUT", "Request body must be JSON.");

  const allowedStatus = ["todo", "in_progress", "in_review", "done"];
  const allowedPriority = ["low", "medium", "high"];

  const task = await updateTask(id, {
    title: typeof body.title === "string" ? body.title.trim() : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    status: allowedStatus.includes(body.status) ? body.status : undefined,
    priority: allowedPriority.includes(body.priority) ? body.priority : undefined,
    assigneeId: body.assigneeId === null || typeof body.assigneeId === "string" ? body.assigneeId : undefined,
    columnId: typeof body.columnId === "string" ? body.columnId : undefined,
    index: typeof body.index === "number" ? body.index : undefined,
    actorId: access.user.id,
  });

  if (!task) return jsonError(404, "NOT_FOUND", "Task not found.");
  return NextResponse.json({ task });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(req, id);
  if (access instanceof NextResponse) return access;

  const ok = await deleteTask(id, access.user.id);
  if (!ok) return jsonError(404, "NOT_FOUND", "Task not found.");
  return NextResponse.json({ ok: true });
}
