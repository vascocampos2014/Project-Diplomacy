import { create } from 'zustand';

export type ThemeOverride = 'light' | 'dark' | null;

interface ThemeState {
  override: ThemeOverride;
  setOverride: (override: ThemeOverride) => void;
}

// `override` lets the user force light/dark mode regardless of the system
// preference. `null` means "follow the system" (default behaviour).
export const useThemeStore = create<ThemeState>((set) => ({
  override: null,
  setOverride: (override) => set({ override }),
}));
