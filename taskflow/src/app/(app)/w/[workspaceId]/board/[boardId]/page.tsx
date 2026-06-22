"use client";

import { useParams } from "next/navigation";
import { BoardView } from "@/components/board/BoardView";

export default function BoardPage() {
  const params = useParams<{ workspaceId: string; boardId: string }>();
  return <BoardView boardId={params.boardId} workspaceId={params.workspaceId} />;
}
