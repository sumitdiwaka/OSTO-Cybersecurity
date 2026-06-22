"use client";

import { Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityEvent, User } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/States";

export function ActivityFeed({ events, members }: { events: ActivityEvent[]; members: User[] }) {
  function actor(id: string) {
    return members.find((m) => m.id === id) ?? null;
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-surface/60">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <Radio className="size-3.5 text-primary" />
        <h2 className="font-display text-sm font-semibold text-ink">Activity</h2>
        <span className="ml-auto font-mono text-[10px] text-ink-faint">polling · 4s</span>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-3 py-3">
        {events.length === 0 && (
          <EmptyState title="No activity yet" description="Updates to this board will show up here." />
        )}

        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {events.map((event) => {
              const user = actor(event.actorId);
              return (
                <motion.li
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="flex gap-2.5 rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-primary-soft/40"
                >
                  <Avatar user={user} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs leading-snug text-ink">
                      <span className="font-medium">{user?.name ?? "Someone"}</span>{" "}
                      <span className="text-ink-muted">{event.message}</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink-faint">{timeAgo(event.createdAt)}</p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </aside>
  );
}