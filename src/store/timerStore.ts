import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerData } from "@/types/timer";

interface TimerStore extends TimerData {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

let interval: number | undefined;

export const useTimerStore = create<TimerStore>(
  persist(
    (set, get) => ({
      state: "stopped",
      time: 0,
      startTime: null,
      mode: "list",

      start: () => {
        clearInterval(interval);
        const now = new Date().toISOString();
        set({ state: "running", startTime: now, time: 0 });
        interval = window.setInterval(() => {
          set((state) => ({ time: state.time + 1 }));
        }, 1000);
      },

      pause: () => {
        clearInterval(interval);
        set({ state: "paused", startTime: null });
      },

      resume: () => {
        clearInterval(interval);
        const now = new Date().toISOString();
        set({ state: "running", startTime: now });
        interval = window.setInterval(() => {
          const { time } = get();
          set({ time: time + 1 });
        }, 1000);
      },

      stop: () => {
        clearInterval(interval);
        set({ state: "stopped", startTime: null });
      },

      reset: () => {
        clearInterval(interval);
        set({ state: "stopped", time: 0, startTime: null });
      },

      setTime: (time) => set({ time }),
    }),
    {
      name: "timer-storage",
    },
  ),
);
