"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { PanelRightClose, PanelRightOpen, Globe2, Link as LinkIcon, Check } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useBoard } from "@/hooks/useBoard";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { useActivity } from "@/hooks/useActivity";
import { useAppStore } from "@/store/useAppStore";
import { Column } from "@/components/board/Column";
import { TaskCard } from "@/components/board/TaskCard";
import { TaskModal } from "@/components/board/TaskModal";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { Skeleton, ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import type { Task } from "@/lib/types";

export function BoardView({ boardId, workspaceId }: { boardId: string; workspaceId: string }) {
  const { board, isLoading, isError, error, refetch } = useBoard(boardId);
  const { createTask, updateTask, moveTask, deleteTask } = useTaskMutations(boardId, workspaceId);
  const { members } = useWorkspaceMembers(workspaceId);
  const { events } = useActivity(workspaceId);

  const editingTaskId = useAppStore((s) => s.editingTaskId);
  const setEditingTaskId = useAppStore((s) => s.setEditingTaskId);
  const newTaskColumnId = useAppStore((s) => s.isNewTaskOpenForColumn);
  const setNewTaskOpenForColumn = useAppStore((s) => s.setNewTaskOpenForColumn);
  const isActivityPanelOpen = useAppStore((s) => s.isActivityPanelOpen);
  const toggleActivityPanel = useAppStore((s) => s.toggleActivityPanel);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  if (isLoading) {
    return (
      <main className="flex-1 p-6">
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !board) {
    return (
      <main className="flex-1 p-6">
        <ErrorState message={error?.message ?? "Couldn't load this board."} onRetry={() => refetch()} />
      </main>
    );
  }

  function findColumnForTask(taskId: string) {
    return board!.columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart(e: DragStartEvent) {
    const task = board!.columns.flatMap((c) => c.tasks).find((t) => t.id === e.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    const sourceColumn = findColumnForTask(active.id as string);
    if (!sourceColumn) return;

    const overIsColumn = board!.columns.some((c) => c.id === over.id);
    let destColumnId: string;
    let destIndex: number;

    if (overIsColumn) {
      destColumnId = over.id as string;
      const destCol = board!.columns.find((c) => c.id === destColumnId)!;
      destIndex = destCol.tasks.length;
    } else {
      const destCol = findColumnForTask(over.id as string);
      if (!destCol) return;
      destColumnId = destCol.id;
      destIndex = destCol.tasks.findIndex((t) => t.id === over.id);
    }

    if (destColumnId === sourceColumn.id) {
      const sourceIndex = sourceColumn.tasks.findIndex((t) => t.id === active.id);
      if (sourceIndex === -1) return;
      if (sourceIndex < destIndex) destIndex -= 1;
      if (sourceIndex === destIndex) return; // dropped in place, nothing to do
    }

    moveTask.mutate({ taskId: active.id as string, columnId: destColumnId, index: destIndex });
  }

  const editingTask = editingTaskId
    ? board.columns.flatMap((c) => c.tasks).find((t) => t.id === editingTaskId)
    : undefined;

  async function copyPublicLink() {
    const url = `${window.location.origin}/public/board/${boardId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="flex min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-surface/60 px-5 py-3">
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">{board.title}</h1>
            <p className="text-xs text-ink-muted">{board.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {board.isPublic && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={copyPublicLink}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
              >
                {copied ? <Check className="size-3.5 text-success" /> : <LinkIcon className="size-3.5" />}
                {copied ? "Copied" : "Copy public link"}
              </motion.button>
            )}
            {board.isPublic && (
              <Badge tone="primary">
                <Globe2 className="size-3" /> Public
              </Badge>
            )}
            <button
              onClick={toggleActivityPanel}
              className="rounded-[var(--radius-sm)] p-1.5 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary"
              title={isActivityPanelOpen ? "Hide activity" : "Show activity"}
            >
              {isActivityPanelOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="scroll-thin min-h-0 flex-1 overflow-x-auto p-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={clsx("flex h-full gap-4")}>
              {board.columns.map((column, i) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <Column
                    column={column}
                    members={members}
                    onTaskClick={setEditingTaskId}
                    onAddTask={setNewTaskOpenForColumn}
                  />
                </motion.div>
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  assignee={members.find((m) => m.id === activeTask.assigneeId) ?? null}
                  isOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <AnimatePresence>
        {isActivityPanelOpen && (
          <motion.div
            key="activity-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ActivityFeed events={events} members={members} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newTaskColumnId && (
          <TaskModal
            key="new-task-modal"
            mode="create"
            members={members}
            isSaving={createTask.isPending}
            onClose={() => setNewTaskOpenForColumn(null)}
            onSubmit={(values) => {
              createTask.mutate(
                { boardId, columnId: newTaskColumnId, ...values },
                { onSuccess: () => setNewTaskOpenForColumn(null) }
              );
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingTask && (
          <TaskModal
            key="edit-task-modal"
            mode="edit"
            task={editingTask}
            members={members}
            isSaving={updateTask.isPending}
            isDeleting={deleteTask.isPending}
            onClose={() => setEditingTaskId(null)}
            onSubmit={(values) => {
              updateTask.mutate(
                { taskId: editingTask.id, input: values },
                { onSuccess: () => setEditingTaskId(null) }
              );
            }}
            onDelete={() => {
              deleteTask.mutate(editingTask.id, { onSuccess: () => setEditingTaskId(null) });
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}