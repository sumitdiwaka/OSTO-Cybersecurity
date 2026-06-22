import { create } from "zustand";

/**
 * Zustand holds UI state only: which workspace is active, whether panels
 * are open, which task is being edited. Server data (user, boards, tasks,
 * activity) lives in React Query's cache instead — see hooks/. Splitting
 * it this way avoids the classic mistake of duplicating server state into
 * a client store and then fighting to keep the two in sync.
 */
interface AppState {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;

  isActivityPanelOpen: boolean;
  toggleActivityPanel: () => void;

  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;

  isNewTaskOpenForColumn: string | null;
  setNewTaskOpenForColumn: (columnId: string | null) => void;

  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentWorkspaceId: null,
  setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),

  isActivityPanelOpen: true,
  toggleActivityPanel: () => set((s) => ({ isActivityPanelOpen: !s.isActivityPanelOpen })),

  editingTaskId: null,
  setEditingTaskId: (id) => set({ editingTaskId: id }),

  isNewTaskOpenForColumn: null,
  setNewTaskOpenForColumn: (columnId) => set({ isNewTaskOpenForColumn: columnId }),

  sessionExpired: false,
  setSessionExpired: (expired) => set({ sessionExpired: expired }),
}));
