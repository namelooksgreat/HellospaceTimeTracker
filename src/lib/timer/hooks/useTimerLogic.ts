import { useCallback } from "react";
import { useTimerStore } from "@/store/timerStore";
import { useTimeEntryStore } from "@/store/timeEntryStore";

export function useTimerLogic() {
  const {
    state,
    time,
    compactView,
    start,
    pause,
    resume,
    stop,
    reset,
    toggleCompactView,
  } = useTimerStore();
  const { setDuration } = useTimeEntryStore();

  const handleTimerAction = useCallback(() => {
    if (state === "stopped") start();
    else if (state === "running") pause();
    else if (state === "paused") resume();
  }, [state, start, pause, resume]);

  const handleStop = useCallback(() => {
    pause();
    setDuration(time);
    return time;
  }, [pause, time, setDuration]);

  const handleReset = useCallback(() => {
    stop();
    reset();
    setDuration(0);
    // Force state update
    window.dispatchEvent(new Event("storage"));
  }, [stop, reset, setDuration]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  }, []);

  return {
    state,
    time,
    compactView,
    formattedTime: formatTime(time),
    handleTimerAction,
    handleStop,
    handleReset,
    formatTime,
    toggleCompactView,
  };
}
