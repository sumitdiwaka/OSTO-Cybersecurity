/**
 * Core domain types for TaskFlow.
 *
 * Kept in one file deliberately: the whole assignment revolves around a
 * single shape (Workspace -> Board -> Column -> Task), and colocating it
 * makes that relationship easy to see and keeps every layer (mock API,
 * hooks, components) importing from one source of truth.
 */

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string; // used for the initials badge, see Avatar component
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  memberIds: string[];
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  isPublic: boolean; // controls whether /public/board/[id] resolves
  columnOrder: string[]; // ordered list of Column ids
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string; // top-accent color, also doubles as a status cue
  taskIds: string[]; // ordered list of Task ids within this column
}

export interface Task {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | "task_created"
  | "task_moved"
  | "task_updated"
  | "task_deleted"
  | "task_reordered";

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  boardId: string;
  type: ActivityType;
  actorId: string;
  taskId: string | null;
  message: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

/** Shape returned by GET /api/board/:id and GET /api/public/board/:id */
export interface BoardWithColumns extends Board {
  columns: (Column & { tasks: Task[] })[];
}
