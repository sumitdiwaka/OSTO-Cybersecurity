"use client";

import { Radio, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityEvent, User } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/States";
import { useAppStore } from "@/store/useAppStore";

export function ActivityFeed({ events, members }: { events: ActivityEvent[]; members: User[] }) {
  const isOpen = useAppStore((s) => s.isActivityPanelOpen);
  const toggle = useAppStore((s) => s.toggleActivityPanel);

  function actor(id: string) {
    return members.find((m) => m.id === id) ?? null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — click to close */}
          <motion.div
            key="activity-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-20 bg-ink/10 backdrop-blur-[2px]"
            onClick={toggle}
          />

          {/* Panel slides in from RIGHT, floats OVER the board */}
          <motion.aside
            key="activity-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed bottom-0 right-0 top-14 z-30 flex w-80 flex-col border-l border-border bg-surface shadow-[var(--shadow-glow-lg)]"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <Radio className="size-3.5 text-primary" />
              <h2 className="font-display text-sm font-semibold text-ink">Activity</h2>
              <span className="ml-1 font-mono text-[10px] text-ink-faint">polling · 4s</span>
              <button
                onClick={toggle}
                className="ml-auto rounded-[var(--radius-sm)] p-1 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="scroll-thin flex-1 overflow-y-auto px-3 py-3">
              {events.length === 0 && (
                <EmptyState title="No activity yet" description="Updates to this board will show up here." />
              )}
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {events.map((event) => {
                    const user = actor(event.actorId);
                    return (
                      <motion.li
                        key={event.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="flex gap-2.5 rounded-[var(--radius-md)] p-2 transition-colors hover:bg-primary-soft/40"
                      >
                        <Avatar user={user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs leading-snug text-ink">
                            <span className="font-semibold">{user?.name ?? "Someone"}</span>{" "}
                            <span className="text-ink-muted">{event.message}</span>
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                            {timeAgo(event.createdAt)}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>

            <div className="border-t border-border px-4 py-2">
              <p className="font-mono text-[10px] text-ink-faint">
                {events.length} events · updates every 4s
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}