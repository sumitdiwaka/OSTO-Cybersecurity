import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/server/api-helpers";
import { getPublicBoard } from "@/lib/server/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const board = await getPublicBoard(id);
  if (!board) {
    return jsonError(404, "NOT_FOUND", "This board doesn't exist or isn't public.");
  }
  return NextResponse.json({ board });
}
