"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Globe2, Lock, ChevronRight, X } from "lucide-react";
import { useWorkspaces, useBoards } from "@/hooks/useWorkspaces";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/ui/States";

export function Sidebar() {
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const closeSidebar = useAppStore((s) => s.closeSidebar);
  const params = useParams<{ workspaceId?: string; boardId?: string }>();
  const router = useRouter();

  const { workspaces, isLoading: wsLoading } = useWorkspaces();
  const { boards, isLoading: boardsLoading } = useBoards(params.workspaceId ?? null);

  const currentWorkspaceId = params.workspaceId;
  const currentBoardId = params.boardId;

  function navigate(href: string) {
    closeSidebar();
    router.push(href);
  }

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop — click anywhere outside to close */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-sm"
            onClick={closeSidebar}
          />

          {/* Sidebar drawer slides in from left */}
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-surface shadow-[var(--shadow-glow-lg)]"
          >
            {/* Gradient header */}
            <div className="gradient-brand flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] bg-white/20 font-mono text-sm font-bold text-white">
                  T
                </span>
                <span className="font-display text-base font-semibold text-white">TaskFlow</span>
              </div>
              <button
                onClick={closeSidebar}
                className="rounded-[var(--radius-sm)] p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
              <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Workspaces
              </p>

              {wsLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              <ul className="space-y-0.5">
                {workspaces.map((ws) => {
                  const isActive = ws.id === currentWorkspaceId;
                  return (
                    <li key={ws.id}>
                      <button
                        onClick={() => navigate(`/w/${ws.id}`)}
                        className={`flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2.5 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-primary-soft font-medium text-primary"
                            : "text-ink-muted hover:bg-bg hover:text-ink"
                        }`}
                      >
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${isActive ? "gradient-primary text-white" : "bg-bg text-ink-faint"}`}>
                          <Layers className="size-3.5" />
                        </span>
                        <span className="truncate">{ws.name}</span>
                        {isActive && <ChevronRight className="ml-auto size-3.5 shrink-0 text-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {currentWorkspaceId && (
                <div className="mt-5">
                  <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    Boards
                  </p>

                  {boardsLoading && (
                    <div className="space-y-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  )}

                  <ul className="space-y-0.5">
                    {boards.map((board) => {
                      const isActive = board.id === currentBoardId;
                      return (
                        <li key={board.id}>
                          <button
                            onClick={() => navigate(`/w/${currentWorkspaceId}/board/${board.id}`)}
                            className={`flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2.5 text-left text-sm transition-colors ${
                              isActive
                                ? "bg-primary-soft font-medium text-primary"
                                : "text-ink-muted hover:bg-bg hover:text-ink"
                            }`}
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center text-ink-faint">
                              {board.isPublic ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}
                            </span>
                            <span className="truncate">{board.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-3">
              <p className="font-mono text-[10px] text-ink-faint">© {new Date().getFullYear()} TaskFlow</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}