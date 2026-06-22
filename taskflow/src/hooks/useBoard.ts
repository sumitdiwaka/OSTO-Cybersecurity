"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export function useBoard(boardId: string | null) {
  const query = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => endpoints.getBoard(boardId as string),
    enabled: !!boardId,
  });

  return {
    board: query.data?.board ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
