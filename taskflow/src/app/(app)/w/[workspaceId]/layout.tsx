"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAppStore } from "@/store/useAppStore";

/**
 * The URL is the source of truth for "which workspace am I in" (it's
 * shareable, back/forward-button-friendly, and survives a refresh for
 * free). This layout's only job is to mirror that into the Zustand store
 * so components that aren't directly under this route segment — like a
 * future global search bar — can still read the current workspace without
 * drilling props.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ workspaceId: string }>();
  const setCurrentWorkspaceId = useAppStore((s) => s.setCurrentWorkspaceId);

  useEffect(() => {
    setCurrentWorkspaceId(params.workspaceId);
    return () => setCurrentWorkspaceId(null);
  }, [params.workspaceId, setCurrentWorkspaceId]);

  return (
    <div className="flex h-screen flex-col">
      <Navbar currentWorkspaceId={params.workspaceId} />
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}
