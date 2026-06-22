"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import type { Task, User } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PRIORITY_LABEL, timeAgo } from "@/lib/utils";

const PRIORITY_TONE = {
  low: "success",
  medium: "primary",
  high: "accent",
} as const;

function CardContent({ task, assignee }: { task: Task; assignee: User | null }) {
  return (
    <>
      <p className="mb-2 text-sm font-medium leading-snug text-ink">{task.title}</p>
      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs text-ink-muted">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
          <span className="font-mono text-[10px] text-ink-faint">{timeAgo(task.updatedAt)}</span>
        </div>
        <Avatar user={assignee} size="sm" />
      </div>
    </>
  );
}

export function TaskCard({
  task,
  assignee,
  onClick,
  isOverlay,
}: {
  task: Task;
  assignee: User | null;
  onClick?: () => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { columnId: task.columnId },
    disabled: isOverlay,
  });

  if (isOverlay) {
    return (
      <motion.div
        initial={{ scale: 1.04, rotate: -2 }}
        animate={{ scale: 1.05, rotate: -3 }}
        className="w-72 cursor-grabbing rounded-[var(--radius-md)] border border-primary/30 bg-surface p-3 text-left shadow-[var(--shadow-glow-lg)]"
      >
        <CardContent task={task} assignee={assignee} />
      </motion.div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "group w-full rounded-[var(--radius-md)] border border-border bg-surface p-3 text-left shadow-[var(--shadow-card)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]",
        isDragging && "opacity-30"
      )}
    >
      <CardContent task={task} assignee={assignee} />
    </button>
  );
}