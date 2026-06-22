import "server-only";
import type {
  ActivityEvent,
  Board,
  BoardWithColumns,
  Column,
  Task,
  User,
  Workspace,
} from "@/lib/types";

/**
 * In-memory mock "database".
 *
 * This intentionally is NOT a real database. The assignment asks for a
 * frontend with a "clean abstraction for API interaction" backed by mock
 * APIs — it does not ask for a persistence layer. Using Next.js route
 * handlers + an in-memory store keeps the whole thing runnable with zero
 * external services while still exercising the exact same fetch/loading/
 * error/mutation code paths a real backend would require.
 *
 * Trade-off (documented in ENGINEERING_NOTES.md): data resets whenever the
 * server process restarts, and won't survive serverless cold starts in
 * production. For this assignment that's the right trade-off; swapping in
 * Postgres/Prisma later would only mean rewriting this file, since every
 * route handler talks to the store through the functions below rather
 * than poking arrays directly.
 */

let users: User[] = [
  { id: "u1", name: "Alice Chen", email: "alice@taskflow.dev", avatarColor: "#2F6F5E" },
  { id: "u2", name: "Bilal Khan", email: "bilal@taskflow.dev", avatarColor: "#7C5CFC" },
  { id: "u3", name: "Priya Sharma", email: "priya@taskflow.dev", avatarColor: "#C2622F" },
];

// Mock-only: plain text is fine for a local fixture, never do this for a
// real auth system. See ENGINEERING_NOTES.md.
const credentials: Record<string, string> = {
  "alice@taskflow.dev": "password123",
  "bilal@taskflow.dev": "password123",
  "priya@taskflow.dev": "password123",
};

let workspaces: Workspace[] = [
  { id: "w1", name: "Product Engineering", slug: "product-engineering", memberIds: ["u1", "u2", "u3"] },
  { id: "w2", name: "Marketing", slug: "marketing", memberIds: ["u1", "u3"] },
];

let boards: Board[] = [
  {
    id: "b1",
    workspaceId: "w1",
    title: "Q3 Roadmap",
    description: "Top-level engineering initiatives for the quarter.",
    isPublic: true,
    columnOrder: ["c1", "c2", "c3", "c4"],
    createdAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "b2",
    workspaceId: "w1",
    title: "Bug Triage",
    description: "Incoming bugs, sorted by severity.",
    isPublic: false,
    columnOrder: ["c5", "c6", "c7", "c8"],
    createdAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "b3",
    workspaceId: "w2",
    title: "Campaign Launch",
    description: "Public launch checklist for the autumn campaign.",
    isPublic: true,
    columnOrder: ["c9", "c10", "c11", "c12"],
    createdAt: "2026-05-01T09:00:00.000Z",
  },
];

let columns: Column[] = [
  { id: "c1", boardId: "b1", title: "Backlog", color: "#8B92A1", taskIds: ["t1", "t2"] },
  { id: "c2", boardId: "b1", title: "In Progress", color: "#7C5CFC", taskIds: ["t3"] },
  { id: "c3", boardId: "b1", title: "In Review", color: "#C2622F", taskIds: ["t4"] },
  { id: "c4", boardId: "b1", title: "Done", color: "#2F6F5E", taskIds: ["t5"] },

  { id: "c5", boardId: "b2", title: "Reported", color: "#8B92A1", taskIds: ["t6", "t7"] },
  { id: "c6", boardId: "b2", title: "Investigating", color: "#7C5CFC", taskIds: ["t8"] },
  { id: "c7", boardId: "b2", title: "Fix Ready", color: "#C2622F", taskIds: [] },
  { id: "c8", boardId: "b2", title: "Resolved", color: "#2F6F5E", taskIds: ["t9"] },

  { id: "c9", boardId: "b3", title: "Ideas", color: "#8B92A1", taskIds: ["t10"] },
  { id: "c10", boardId: "b3", title: "In Progress", color: "#7C5CFC", taskIds: [] },
  { id: "c11", boardId: "b3", title: "In Review", color: "#C2622F", taskIds: [] },
  { id: "c12", boardId: "b3", title: "Shipped", color: "#2F6F5E", taskIds: ["t11"] },
];

let tasks: Task[] = [
  { id: "t1", boardId: "b1", columnId: "c1", title: "Define API rate-limit policy", description: "Decide per-plan limits and where they're enforced.", status: "todo", assigneeId: "u2", priority: "medium", createdAt: "2026-04-02T09:05:00.000Z", updatedAt: "2026-04-02T09:05:00.000Z" },
  { id: "t2", boardId: "b1", columnId: "c1", title: "Spike: websocket vs polling", description: "Evaluate feasibility for live board updates.", status: "todo", assigneeId: "u1", priority: "low", createdAt: "2026-04-03T09:05:00.000Z", updatedAt: "2026-04-03T09:05:00.000Z" },
  { id: "t3", boardId: "b1", columnId: "c2", title: "Multi-workspace switcher", description: "Persist last-active workspace per user.", status: "in_progress", assigneeId: "u1", priority: "high", createdAt: "2026-04-04T09:05:00.000Z", updatedAt: "2026-05-01T11:00:00.000Z" },
  { id: "t4", boardId: "b1", columnId: "c3", title: "Public board SEO pass", description: "Open Graph tags + structured data for shared boards.", status: "in_review", assigneeId: "u3", priority: "high", createdAt: "2026-04-05T09:05:00.000Z", updatedAt: "2026-05-02T11:00:00.000Z" },
  { id: "t5", boardId: "b1", columnId: "c4", title: "Set up CI pipeline", description: "Lint + typecheck + build on every PR.", status: "done", assigneeId: "u2", priority: "medium", createdAt: "2026-03-20T09:05:00.000Z", updatedAt: "2026-03-28T09:05:00.000Z" },

  { id: "t6", boardId: "b2", columnId: "c5", title: "Drag handle misaligned on Safari", description: "Reported by two users on 16.4.", status: "todo", assigneeId: "u3", priority: "low", createdAt: "2026-05-10T09:05:00.000Z", updatedAt: "2026-05-10T09:05:00.000Z" },
  { id: "t7", boardId: "b2", columnId: "c5", title: "Session doesn't expire on server clock skew", description: "Token TTL math needs server time, not client.", status: "todo", assigneeId: "u1", priority: "high", createdAt: "2026-05-11T09:05:00.000Z", updatedAt: "2026-05-11T09:05:00.000Z" },
  { id: "t8", boardId: "b2", columnId: "c6", title: "Task reorder occasionally duplicates id", description: "Race condition on rapid drag events.", status: "in_progress", assigneeId: "u2", priority: "high", createdAt: "2026-05-12T09:05:00.000Z", updatedAt: "2026-05-14T09:05:00.000Z" },
  { id: "t9", boardId: "b2", columnId: "c8", title: "Login error copy unclear", description: "Resolved: now states the exact reason.", status: "done", assigneeId: "u3", priority: "low", createdAt: "2026-05-01T09:05:00.000Z", updatedAt: "2026-05-03T09:05:00.000Z" },

  { id: "t10", boardId: "b3", columnId: "c9", title: "Draft launch announcement", description: "Blog post + social copy.", status: "todo", assigneeId: "u3", priority: "medium", createdAt: "2026-05-15T09:05:00.000Z", updatedAt: "2026-05-15T09:05:00.000Z" },
  { id: "t11", boardId: "b3", columnId: "c12", title: "Landing page live", description: "Shipped to production.", status: "done", assigneeId: "u1", priority: "medium", createdAt: "2026-05-02T09:05:00.000Z", updatedAt: "2026-05-16T09:05:00.000Z" },
];

let activity: ActivityEvent[] = [
  { id: "a1", workspaceId: "w1", boardId: "b1", type: "task_updated", actorId: "u3", taskId: "t4", message: "Priya moved \u201cPublic board SEO pass\u201d to In Review", createdAt: "2026-05-02T11:00:00.000Z" },
  { id: "a2", workspaceId: "w1", boardId: "b1", type: "task_updated", actorId: "u1", taskId: "t3", message: "Alice updated \u201cMulti-workspace switcher\u201d", createdAt: "2026-05-01T11:00:00.000Z" },
];

let activityCounter = activity.length;
let taskCounter = tasks.length;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Simulates realistic network latency so loading states are meaningfully exercised. */
async function networkDelay() {
  await delay(180 + Math.random() * 320);
}

export async function findUserByEmail(email: string) {
  await networkDelay();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function checkPassword(email: string, password: string) {
  return credentials[email.toLowerCase()] === password;
}

export async function getUser(id: string) {
  await networkDelay();
  return users.find((u) => u.id === id) ?? null;
}

export async function getUsersByIds(ids: string[]) {
  await networkDelay();
  return users.filter((u) => ids.includes(u.id));
}

export async function getUsers() {
  await networkDelay();
  return users;
}

export async function getWorkspacesForUser(userId: string) {
  await networkDelay();
  return workspaces.filter((w) => w.memberIds.includes(userId));
}

export async function getWorkspace(id: string) {
  await networkDelay();
  return workspaces.find((w) => w.id === id) ?? null;
}

export async function isWorkspaceMember(workspaceId: string, userId: string) {
  const ws = workspaces.find((w) => w.id === workspaceId);
  return !!ws?.memberIds.includes(userId);
}

export async function getBoardsForWorkspace(workspaceId: string) {
  await networkDelay();
  return boards.filter((b) => b.workspaceId === workspaceId);
}

function assembleBoard(board: Board): BoardWithColumns {
  const boardColumns = board.columnOrder
    .map((cid) => columns.find((c) => c.id === cid))
    .filter((c): c is Column => !!c)
    .map((col) => ({
      ...col,
      tasks: col.taskIds
        .map((tid) => tasks.find((t) => t.id === tid))
        .filter((t): t is Task => !!t),
    }));
  return { ...board, columns: boardColumns };
}

export async function getBoard(id: string) {
  await networkDelay();
  const board = boards.find((b) => b.id === id);
  if (!board) return null;
  return assembleBoard(board);
}

/** Same as getBoard but skips the artificial latency floor for public pages rendered server-side. */
export async function getPublicBoard(id: string) {
  const board = boards.find((b) => b.id === id && b.isPublic);
  if (!board) return null;
  return assembleBoard(board);
}

export async function getAllPublicBoardIds() {
  return boards.filter((b) => b.isPublic).map((b) => b.id);
}

export async function getBoardMeta(id: string) {
  return boards.find((b) => b.id === id) ?? null;
}

export async function getTaskMeta(id: string) {
  return tasks.find((t) => t.id === id) ?? null;
}

interface CreateTaskInput {
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Task["priority"];
  assigneeId: string | null;
  actorId: string;
}

export async function createTask(input: CreateTaskInput) {
  await networkDelay();
  taskCounter += 1;
  const now = new Date().toISOString();
  const task: Task = {
    id: `t${taskCounter}`,
    boardId: input.boardId,
    columnId: input.columnId,
    title: input.title,
    description: input.description,
    status: "todo",
    assigneeId: input.assigneeId,
    priority: input.priority,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  const col = columns.find((c) => c.id === input.columnId);
  col?.taskIds.push(task.id);

  await logActivity({
    boardId: task.boardId,
    type: "task_created",
    actorId: input.actorId,
    taskId: task.id,
    message: `created \u201c${task.title}\u201d`,
  });

  return task;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  assigneeId?: string | null;
  columnId?: string;
  /** Target index within the destination column, for drag-and-drop reordering. */
  index?: number;
  actorId: string;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  await networkDelay();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const fromColumnId = task.columnId;
  const movingColumns = input.columnId !== undefined && input.columnId !== fromColumnId;
  const reordering = input.index !== undefined;

  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.status !== undefined) task.status = input.status;
  if (input.priority !== undefined) task.priority = input.priority;
  if (input.assigneeId !== undefined) task.assigneeId = input.assigneeId;

  if (movingColumns || reordering) {
    const fromCol = columns.find((c) => c.id === fromColumnId);
    if (fromCol) fromCol.taskIds = fromCol.taskIds.filter((id) => id !== task.id);

    const toColumnId = input.columnId ?? fromColumnId;
    const toCol = columns.find((c) => c.id === toColumnId);
    if (toCol) {
      const idx = input.index ?? toCol.taskIds.length;
      toCol.taskIds.splice(Math.max(0, Math.min(idx, toCol.taskIds.length)), 0, task.id);
    }
    task.columnId = toColumnId;
  }

  task.updatedAt = new Date().toISOString();

  if (movingColumns) {
    const toCol = columns.find((c) => c.id === task.columnId);
    await logActivity({
      boardId: task.boardId,
      type: "task_moved",
      actorId: input.actorId,
      taskId: task.id,
      message: `moved \u201c${task.title}\u201d to ${toCol?.title ?? "another column"}`,
    });
  } else if (reordering) {
    await logActivity({
      boardId: task.boardId,
      type: "task_reordered",
      actorId: input.actorId,
      taskId: task.id,
      message: `reordered \u201c${task.title}\u201d`,
    });
  } else {
    await logActivity({
      boardId: task.boardId,
      type: "task_updated",
      actorId: input.actorId,
      taskId: task.id,
      message: `updated \u201c${task.title}\u201d`,
    });
  }

  return task;
}

export async function deleteTask(taskId: string, actorId: string) {
  await networkDelay();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return false;

  const col = columns.find((c) => c.id === task.columnId);
  if (col) col.taskIds = col.taskIds.filter((id) => id !== taskId);
  tasks = tasks.filter((t) => t.id !== taskId);

  await logActivity({
    boardId: task.boardId,
    type: "task_deleted",
    actorId,
    taskId: null,
    message: `deleted \u201c${task.title}\u201d`,
  });

  return true;
}

async function logActivity(input: {
  boardId: string;
  type: ActivityEvent["type"];
  actorId: string;
  taskId: string | null;
  message: string;
}) {
  const board = boards.find((b) => b.id === input.boardId);
  if (!board) return;
  activityCounter += 1;
  const event: ActivityEvent = {
    id: `a${activityCounter}`,
    workspaceId: board.workspaceId,
    boardId: input.boardId,
    type: input.type,
    actorId: input.actorId,
    taskId: input.taskId,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  activity.unshift(event);
  activity = activity.slice(0, 200); // bounded log, this is a demo store
}

export async function getActivity(workspaceId: string, sinceIso?: string) {
  // No artificial delay: this endpoint is polled every few seconds and
  // should feel closer to instantaneous than a regular page fetch.
  let events = activity.filter((e) => e.workspaceId === workspaceId);
  if (sinceIso) {
    events = events.filter((e) => e.createdAt > sinceIso);
  }
  return events.slice(0, 30);
}
