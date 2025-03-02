import { create } from "zustand";
import { preciseTimer } from "@/lib/services/preciseTimer";

type TimerState = "stopped" | "running" | "paused";

interface TimerStore {
  state: TimerState;
  time: number;
  startTimestamp: number | null;
  compactView: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  toggleCompactView: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => {
  const saveState = () => {
    const state = get();
    localStorage.setItem(
      "timer_state",
      JSON.stringify({
        state: state.state,
        time: state.time,
        startTimestamp: state.startTimestamp,
      }),
    );
  };

  // Load and calculate initial state
  const savedStateStr = localStorage.getItem("timer_state");
  const savedState = savedStateStr ? JSON.parse(savedStateStr) : null;

  let initialTime = savedState?.time || 0;
  if (savedState?.state === "running" && savedState?.startTimestamp) {
    const now = Date.now();
    const startTime = savedState.startTimestamp;
    const elapsedSinceLastSave = Math.floor((now - startTime) / 1000);
    initialTime = savedState.time;
  }

  // Check if compact view preference is saved
  const savedCompactView = localStorage.getItem("timer_compact_view");
  const initialCompactView = savedCompactView
    ? JSON.parse(savedCompactView)
    : false;

  const initialState = {
    state: (savedState?.state as TimerState) || "stopped",
    time: initialTime,
    startTimestamp: savedState?.state === "running" ? Date.now() : null,
    compactView: initialCompactView,
  };

  // Start timer if it was running
  if (initialState.state === "running") {
    preciseTimer.start((elapsedTime) => {
      set({ time: elapsedTime });
      saveState();
    }, initialTime);
  }

  return {
    ...initialState,

    start: () => {
      const startTime = Date.now();
      set({ state: "running", startTimestamp: startTime });

      preciseTimer.start((elapsedTime) => {
        set({ time: elapsedTime });
        saveState();
      }, get().time);
    },

    pause: () => {
      preciseTimer.pause();
      const currentTime = preciseTimer.getCurrentTime();

      set({
        state: "paused",
        startTimestamp: null,
        time: currentTime,
      });

      saveState();
    },

    resume: () => {
      const startTime = Date.now();
      set({ state: "running", startTimestamp: startTime });

      preciseTimer.start((elapsedTime) => {
        set({ time: elapsedTime });
        saveState();
      }, get().time);
    },

    stop: () => {
      const finalTime = preciseTimer.stop();
      set({
        state: "stopped",
        startTimestamp: null,
        time: finalTime,
      });

      saveState();
    },

    reset: () => {
      preciseTimer.stop();
      set({
        state: "stopped",
        time: 0,
        startTimestamp: null,
      });
      localStorage.removeItem("timer_state");
    },

    toggleCompactView: () => {
      const newCompactView = !get().compactView;
      set({ compactView: newCompactView });
      localStorage.setItem(
        "timer_compact_view",
        JSON.stringify(newCompactView),
      );
    },
  };
});
