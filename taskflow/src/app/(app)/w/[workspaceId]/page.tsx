"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Globe2, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBoards } from "@/hooks/useWorkspaces";
import { Skeleton } from "@/components/ui/States";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";

export default function BoardsPage() {
  const params = useParams<{ workspaceId: string }>();
  const { boards, isLoading, isError, error } = useBoards(params.workspaceId);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-xl font-semibold text-ink">Boards</h1>
        <p className="mt-1 text-sm text-ink-muted">Choose a board to start organizing work.</p>
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}

        {isError && (
          <div className="sm:col-span-2">
            <ErrorState message={error?.message ?? "Couldn't load boards."} />
          </div>
        )}

        {!isLoading && !isError && boards.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState title="No boards yet" description="This workspace doesn't have any boards." />
          </div>
        )}

        {!isLoading &&
          !isError &&
          boards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/w/${params.workspaceId}/board/${board.id}`}
                className="group flex h-full flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-ink">{board.title}</p>
                    <ArrowRight className="size-4 text-ink-faint transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="line-clamp-2 text-sm text-ink-muted">{board.description}</p>
                </div>
                <div className="mt-3">
                  {board.isPublic ? (
                    <Badge tone="primary">
                      <Globe2 className="size-3" /> Public
                    </Badge>
                  ) : (
                    <Badge tone="neutral">
                      <Lock className="size-3" /> Private
                    </Badge>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </main>
  );
}