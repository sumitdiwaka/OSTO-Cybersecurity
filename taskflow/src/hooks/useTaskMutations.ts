"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";
import type { BoardWithColumns, Task } from "@/lib/types";

/**
 * All mutations here follow the same shape: snapshot the current board
 * from the cache, write an optimistic version immediately (so drag-and-
 * drop feels instant), then roll back to the snapshot if the request
 * fails. This is what "optimistic updates" means in the optional-
 * enhancements list — implemented here rather than skipped, because
 * drag-and-drop without it feels laggy even on a fast mock API.
 */

function cloneBoard(board: BoardWithColumns): BoardWithColumns {
  return {
    ...board,
    columns: board.columns.map((c) => ({ ...c, tasks: [...c.tasks] })),
  };
}

export function useTaskMutations(boardId: string, workspaceId: string | undefined) {
  const queryClient = useQueryClient();
  const boardKey = ["board", boardId];

  function invalidateActivity() {
    if (workspaceId) queryClient.invalidateQueries({ queryKey: ["activity", workspaceId] });
  }

  const createTask = useMutation({
    mutationFn: endpoints.createTask,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<{ board: BoardWithColumns }>(boardKey);
      if (previous) {
        const next = cloneBoard(previous.board);
        const col = next.columns.find((c) => c.id === input.columnId);
        const tempTask: Task = {
          id: `temp-${Date.now()}`,
          boardId: input.boardId,
          columnId: input.columnId,
          title: input.title,
          description: input.description ?? "",
          status: "todo",
          assigneeId: input.assigneeId ?? null,
          priority: input.priority ?? "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        col?.tasks.push(tempTask);
        queryClient.setQueryData(boardKey, { board: next });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKey });
      invalidateActivity();
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: Parameters<typeof endpoints.updateTask>[1] }) =>
      endpoints.updateTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<{ board: BoardWithColumns }>(boardKey);
      if (previous) {
        const next = cloneBoard(previous.board);
        for (const col of next.columns) {
          const task = col.tasks.find((t) => t.id === taskId);
          if (task) Object.assign(task, input, { updatedAt: new Date().toISOString() });
        }
        queryClient.setQueryData(boardKey, { board: next });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKey });
      invalidateActivity();
    },
  });

  /** Drag-and-drop: move a task to a (possibly new) column at a target index. */
  const moveTask = useMutation({
    mutationFn: ({
      taskId,
      columnId,
      index,
    }: {
      taskId: string;
      columnId: string;
      index: number;
    }) => endpoints.updateTask(taskId, { columnId, index }),
    onMutate: async ({ taskId, columnId, index }) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<{ board: BoardWithColumns }>(boardKey);
      if (previous) {
        const next = cloneBoard(previous.board);
        let moving: Task | undefined;
        for (const col of next.columns) {
          const idx = col.tasks.findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            [moving] = col.tasks.splice(idx, 1);
          }
        }
        const destCol = next.columns.find((c) => c.id === columnId);
        if (moving && destCol) {
          moving.columnId = columnId;
          destCol.tasks.splice(Math.max(0, Math.min(index, destCol.tasks.length)), 0, moving);
        }
        queryClient.setQueryData(boardKey, { board: next });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKey });
      invalidateActivity();
    },
  });

  const deleteTask = useMutation({
    mutationFn: endpoints.deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<{ board: BoardWithColumns }>(boardKey);
      if (previous) {
        const next = cloneBoard(previous.board);
        for (const col of next.columns) {
          col.tasks = col.tasks.filter((t) => t.id !== taskId);
        }
        queryClient.setQueryData(boardKey, { board: next });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKey });
      invalidateActivity();
    },
  });

  return { createTask, updateTask, moveTask, deleteTask };
}
