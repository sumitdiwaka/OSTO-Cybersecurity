import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/server/api-helpers";
import { getUsersByIds, getWorkspace, isWorkspaceMember } from "@/lib/server/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const workspace = await getWorkspace(id);
  if (!workspace) return jsonError(404, "NOT_FOUND", "Workspace not found.");

  const isMember = await isWorkspaceMember(id, auth.user.id);
  if (!isMember) return jsonError(403, "FORBIDDEN", "You don't have access to this workspace.");

  const members = await getUsersByIds(workspace.memberIds);
  return NextResponse.json({ members });
}
