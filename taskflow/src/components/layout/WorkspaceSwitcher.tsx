"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export function WorkspaceSwitcher({ currentWorkspaceId }: { currentWorkspaceId: string }) {
  const { workspaces, isLoading } = useWorkspaces();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = workspaces.find((w) => w.id === currentWorkspaceId);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (isLoading) {
    return <div className="skeleton-shimmer animate-shimmer h-9 w-44 rounded-[var(--radius-sm)]" />;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-48 items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{current?.name ?? "Select workspace"}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronsUpDown className="size-3.5 shrink-0 text-ink-faint" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute left-0 top-11 z-20 w-64 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-[var(--shadow-glow-lg)]"
          >
            {workspaces.map((ws) => (
              <li key={ws.id}>
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(`/w/${ws.id}`);
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-primary-soft",
                    ws.id === currentWorkspaceId ? "font-medium text-primary" : "text-ink-muted"
                  )}
                >
                  {ws.name}
                  {ws.id === currentWorkspaceId && <Check className="size-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}