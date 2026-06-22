"use client";

import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Skeleton } from "@/components/ui/States";
import { ErrorState } from "@/components/ui/States";

export default function WorkspacesPage() {
  const { workspaces, isLoading, isError, error } = useWorkspaces();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-xl font-semibold text-ink">Your workspaces</h1>
          <p className="mt-1 text-sm text-ink-muted">Pick a workspace to see its boards.</p>
        </motion.div>

        <div className="mt-6 space-y-2">
          {isLoading &&
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}

          {isError && <ErrorState message={error?.message ?? "Couldn't load workspaces."} />}

          {!isLoading &&
            !isError &&
            workspaces.map((ws, i) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/w/${ws.id}`}
                  className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="gradient-brand flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-white shadow-[var(--shadow-glow)]">
                      <Layers className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{ws.name}</p>
                      <p className="text-xs text-ink-faint">
                        {ws.memberIds.length} member{ws.memberIds.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-ink-faint transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </motion.div>
            ))}
        </div>
      </main>
    </div>
  );
}