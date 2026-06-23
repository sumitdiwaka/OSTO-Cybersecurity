import { create } from "zustand";

interface AppState {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;

  isActivityPanelOpen: boolean;
  toggleActivityPanel: () => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

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

  isActivityPanelOpen: false,
  toggleActivityPanel: () => set((s) => ({ isActivityPanelOpen: !s.isActivityPanelOpen })),

  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  editingTaskId: null,
  setEditingTaskId: (id) => set({ editingTaskId: id }),

  isNewTaskOpenForColumn: null,
  setNewTaskOpenForColumn: (columnId) => set({ isNewTaskOpenForColumn: columnId }),

  sessionExpired: false,
  setSessionExpired: (expired) => set({ sessionExpired: expired }),
}));