"use client";

import { AlertTriangle, Inbox } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "skeleton-shimmer animate-shimmer rounded-[var(--radius-sm)]",
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-surface/60 px-6 py-12 text-center"
    >
      <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Inbox className="size-4.5" />
      </span>
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </motion.div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-danger-soft bg-danger-soft/40 px-6 py-12 text-center"
    >
      <AlertTriangle className="size-5 text-danger" />
      <p className="text-sm text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </motion.div>
  );
}