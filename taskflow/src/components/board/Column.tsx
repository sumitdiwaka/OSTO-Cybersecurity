"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import type { Column as ColumnType, Task, User } from "@/lib/types";
import { TaskCard } from "@/components/board/TaskCard";

export function Column({
  column,
  members,
  onTaskClick,
  onAddTask,
}: {
  column: ColumnType & { tasks: Task[] };
  members: User[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (columnId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const memberById = (id: string | null) => members.find((m) => m.id === id) ?? null;

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-[var(--radius-lg)] border border-border/60 bg-surface/40">
      <div
        className="h-1.5 w-full rounded-t-[var(--radius-lg)]"
        style={{ background: `linear-gradient(90deg, ${column.color}, ${column.color}99)` }}
        aria-hidden
      />
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-sm font-semibold text-ink">{column.title}</h3>
        <span
          className="rounded-full px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-muted"
          style={{ background: `${column.color}1a` }}
        >
          {column.tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          "scroll-thin flex-1 space-y-2 overflow-y-auto rounded-[var(--radius-md)] px-2 pb-2 transition-colors duration-200",
          isOver && "bg-primary-soft/60 ring-2 ring-inset ring-primary/30"
        )}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={memberById(task.assigneeId)}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>

        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => onAddTask(column.id)}
          className="flex w-full items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-2 text-xs text-ink-faint transition-colors hover:bg-surface hover:text-primary"
        >
          <Plus className="size-3.5" />
          Add task
        </motion.button>
      </div>
    </div>
  );
}