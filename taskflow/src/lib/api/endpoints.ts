import { api } from "@/lib/api/client";
import type {
  ActivityEvent,
  Board,
  BoardWithColumns,
  Task,
  User,
  Workspace,
} from "@/lib/types";

export const endpoints = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>("/api/login", { email, password }),

  logout: () => api.post<{ ok: true }>("/api/logout"),

  me: () => api.get<{ user: User; expiresAt: number }>("/api/me"),

  getWorkspaces: () => api.get<{ workspaces: Workspace[] }>("/api/workspaces"),

  getWorkspaceMembers: (workspaceId: string) =>
    api.get<{ members: User[] }>(`/api/workspaces/${workspaceId}/members`),

  getBoards: (workspaceId: string) =>
    api.get<{ boards: Board[] }>(`/api/boards?workspaceId=${encodeURIComponent(workspaceId)}`),

  getBoard: (boardId: string) => api.get<{ board: BoardWithColumns }>(`/api/board/${boardId}`),

  createTask: (input: {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    priority?: Task["priority"];
    assigneeId?: string | null;
  }) => api.post<{ task: Task }>("/api/task", input),

  updateTask: (
    taskId: string,
    input: Partial<{
      title: string;
      description: string;
      status: Task["status"];
      priority: Task["priority"];
      assigneeId: string | null;
      columnId: string;
      index: number;
    }>
  ) => api.patch<{ task: Task }>(`/api/task/${taskId}`, input),

  deleteTask: (taskId: string) => api.delete<{ ok: true }>(`/api/task/${taskId}`),

  getActivity: (workspaceId: string, since?: string) =>
    api.get<{ events: ActivityEvent[] }>(
      `/api/activity?workspaceId=${encodeURIComponent(workspaceId)}${since ? `&since=${encodeURIComponent(since)}` : ""}`
    ),
};
