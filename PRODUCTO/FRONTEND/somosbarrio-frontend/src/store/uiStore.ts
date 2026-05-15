import { create } from 'zustand'

interface UiState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setTheme: (t: 'light' | 'dark') => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setTheme: (t) => set({ theme: t }),
}))
