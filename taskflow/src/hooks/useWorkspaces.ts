"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export function useWorkspaces() {
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: endpoints.getWorkspaces,
  });

  return {
    workspaces: query.data?.workspaces ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

export function useBoards(workspaceId: string | null) {
  const query = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => endpoints.getBoards(workspaceId as string),
    enabled: !!workspaceId,
  });

  return {
    boards: query.data?.boards ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const query = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => endpoints.getWorkspaceMembers(workspaceId as string),
    enabled: !!workspaceId,
    staleTime: 5 * 60_000,
  });

  return {
    members: query.data?.members ?? [],
    isLoading: query.isLoading,
  };
}
