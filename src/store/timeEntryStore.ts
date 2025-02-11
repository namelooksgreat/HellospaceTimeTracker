import { create } from "zustand";

interface TimeEntryStore {
  duration: number;
  setDuration: (duration: number) => void;
  resetDuration: () => void;
}

export const useTimeEntryStore = create<TimeEntryStore>((set) => ({
  duration: 0,
  setDuration: (duration: number) => set({ duration: Math.max(0, duration) }),
  resetDuration: () => set({ duration: 0 }),
}));
