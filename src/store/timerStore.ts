import { create } from "zustand";
import { TimerState, TimerData } from "@/types/timer";
import { preciseTimer } from "@/lib/services/preciseTimer";
import { TIMER_CONSTANTS } from "@/lib/constants/timer";

interface TimerStore {
  state: TimerState;
  time: number;
  taskName: string;
  projectId: string;
  customerId: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
  setTaskName: (name: string) => void;
  setProjectId: (id: string) => void;
  setCustomerId: (id: string) => void;
}

const STORAGE_KEY = TIMER_CONSTANTS.STORAGE.KEY;

export const useTimerStore = create<TimerStore>((set, get) => {
  const loadState = (): TimerData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const state = JSON.parse(saved);
      if (state.state === "running") {
        const now = Date.now();
        const start = new Date(state.startTime).getTime();
        if (!isNaN(start)) {
          const elapsed = Math.floor((now - start) / 1000);
          const totalTime = state.time + elapsed;

          // Sayfa yüklendiğinde timer'ı otomatik başlat
          setTimeout(() => {
            preciseTimer.start((newElapsed) => {
              set((state) => ({ ...state, time: totalTime + newElapsed }));
            }, 0);
          }, 0);

          return { ...state, time: totalTime };
        }
      }
      return state;
    } catch (error) {
      console.error("Error loading timer state:", error);
      return null;
    }
  };

  const persistState = (state: Partial<TimerStore>) => {
    try {
      const currentState = get();
      const newState = {
        ...currentState,
        ...state,
        startTime: state.state === "running" ? new Date().toISOString() : null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Error saving timer state:", error);
    }
  };

  const savedState = loadState();

  return {
    state: savedState?.state ?? "stopped",
    time: savedState?.time ?? 0,
    taskName: savedState?.taskName ?? "",
    projectId: savedState?.projectId ?? "",
    customerId: savedState?.customerId ?? "",

    start: () => {
      set({ state: "running" });
      persistState({ state: "running", time: 0 });

      preciseTimer.start((elapsed) => {
        set((state) => ({ ...state, time: elapsed }));
      }, 0);
    },

    pause: () => {
      preciseTimer.stop();
      const currentState = get();
      const newState = { state: "paused" as TimerState };
      set(newState);
      persistState({ ...newState, time: currentState.time });
    },

    resume: () => {
      const { time: currentTime } = get();
      set({ state: "running" });
      persistState({ state: "running", time: currentTime });

      preciseTimer.start((elapsed) => {
        set({ state: "running", time: currentTime + elapsed });
      }, 0);
    },

    stop: () => {
      preciseTimer.stop();
      const newState = { state: "stopped" as TimerState };
      set(newState);
      persistState(newState);
    },

    reset: () => {
      preciseTimer.stop();
      const newState = { state: "stopped" as TimerState, time: 0 };
      set(newState);
      persistState(newState);
    },

    setTime: (time: number) => {
      const newState = { time: Math.max(0, time) };
      set(newState);
      persistState(newState);
    },

    setTaskName: (name: string) => {
      const newState = { taskName: name };
      set(newState);
      persistState(newState);
    },

    setProjectId: (id: string) => {
      const newState = { projectId: id };
      set(newState);
      persistState(newState);
    },

    setCustomerId: (id: string) => {
      const newState = { customerId: id };
      set(newState);
      persistState(newState);
    },
  };
});

export const cleanupTimer = () => {
  preciseTimer.stop();
};
