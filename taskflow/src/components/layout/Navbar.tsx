"use client";

import Link from "next/link";
import { LogOut, TimerOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";
import { api } from "@/lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";

export function Navbar({ currentWorkspaceId }: { currentWorkspaceId?: string }) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  async function simulateExpiry() {
    await api.post("/api/dev/expire-session");
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  return (
    <header className="glass sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">

        {/* ☰ Hamburger — three lines */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="group flex size-9 flex-col items-center justify-center gap-[5px] rounded-[var(--radius-sm)] border border-border bg-surface transition-colors hover:border-primary/40 hover:bg-primary-soft"
        >
          <span className="h-[2px] w-[18px] rounded-full bg-ink-muted transition-colors group-hover:bg-primary" />
          <span className="h-[2px] w-[12px] self-start ml-[4px] rounded-full bg-ink-muted transition-colors group-hover:bg-primary" />
          <span className="h-[2px] w-[18px] rounded-full bg-ink-muted transition-colors group-hover:bg-primary" />
        </motion.button>

        <Link href="/workspaces" className="flex items-center gap-2">
          <motion.span
            whileHover={{ rotate: -6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="gradient-brand flex size-7 items-center justify-center rounded-[var(--radius-sm)] font-mono text-sm font-bold text-white shadow-[var(--shadow-glow)]"
          >
            T
          </motion.span>
          <span className="hidden font-display text-sm font-semibold text-ink sm:inline">
            TaskFlow
          </span>
        </Link>

        {currentWorkspaceId && (
          <WorkspaceSwitcher currentWorkspaceId={currentWorkspaceId} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={simulateExpiry}
          className="hidden items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-ink-faint transition-colors hover:bg-warn-soft hover:text-warn md:inline-flex"
        >
          <TimerOff className="size-3.5" />
          Simulate expired session
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <Avatar user={user} size="sm" />
            <span className="hidden text-sm text-ink-muted lg:inline">{user.name}</span>
          </div>
        )}

        <button
          onClick={() => logout()}
          className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}