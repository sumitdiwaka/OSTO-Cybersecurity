"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

const POLL_INTERVAL_MS = 4000;

/**
 * "Real-time" here is simulated with polling rather than websockets — a
 * deliberate scope decision (see ENGINEERING_NOTES.md). React Query's
 * refetchInterval gives us polling, request de-duping, and pause-when-
 * backgrounded for free, so a handful of teammates working on the same
 * board concurrently still see each other's moves without a socket
 * server.
 */
export function useActivity(workspaceId: string | null) {
  const query = useQuery({
    queryKey: ["activity", workspaceId],
    queryFn: () => endpoints.getActivity(workspaceId as string),
    enabled: !!workspaceId,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  return {
    events: query.data?.events ?? [],
    isLoading: query.isLoading,
  };
}
