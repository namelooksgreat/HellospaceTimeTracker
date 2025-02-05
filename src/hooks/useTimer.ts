import { useState, useEffect, useCallback, useRef } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

export type TimerState = "stopped" | "running" | "paused";

interface UseTimerOptions {
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export function useTimer({
  onStart = () => {},
  onStop = () => {},
  onPause = () => {},
  onReset = () => {},
}: UseTimerOptions = {}) {
  // Use refs for values that don't need to trigger re-renders
  const intervalRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);

  // State for values that need to trigger re-renders
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [time, setTime] = useState(0);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(
      STORAGE_KEYS.TIMER_STATE,
    ) as TimerState;
    const savedTime = parseInt(
      localStorage.getItem(STORAGE_KEYS.TIMER_ELAPSED) || "0",
      10,
    );
    const savedStartTime = localStorage.getItem(STORAGE_KEYS.TIMER_START);

    if (savedState === "running" && savedStartTime) {
      const startTime = new Date(savedStartTime).getTime();
      startTimeRef.current = startTime;
      setTime(savedTime);
      setTimerState("running");
    } else if (savedState === "paused") {
      setTime(savedTime);
      setTimerState("paused");
    }
  }, []);

  // Timer update logic
  useEffect(() => {
    if (timerState === "running" && startTimeRef.current) {
      const updateTimer = () => {
        const now = Date.now();
        const baseTime = parseInt(
          localStorage.getItem(STORAGE_KEYS.TIMER_ELAPSED) || "0",
          10,
        );
        const elapsed = Math.floor((now - startTimeRef.current!) / 1000);
        setTime(baseTime + elapsed);
      };

      // Update immediately and then every second
      updateTimer();
      intervalRef.current = window.setInterval(updateTimer, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [timerState]);

  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    setTimerState("running");
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, "running");
    localStorage.setItem(STORAGE_KEYS.TIMER_START, new Date(now).toISOString());
    localStorage.setItem(STORAGE_KEYS.TIMER_ELAPSED, String(time));
    onStart();
  }, [onStart, time]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState("paused");
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, "paused");
    localStorage.setItem(STORAGE_KEYS.TIMER_ELAPSED, String(time));
    startTimeRef.current = null;
    onPause();
  }, [time, onPause]);

  const resume = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    setTimerState("running");
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, "running");
    localStorage.setItem(STORAGE_KEYS.TIMER_START, new Date(now).toISOString());
    localStorage.setItem(STORAGE_KEYS.TIMER_ELAPSED, String(time));
    onStart();
  }, [onStart, time]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState("stopped");
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, "stopped");
    localStorage.setItem(STORAGE_KEYS.TIMER_ELAPSED, String(time));
    startTimeRef.current = null;
    onStop();
  }, [time, onStop]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTime(0);
    setTimerState("stopped");
    startTimeRef.current = null;
    localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
    localStorage.removeItem(STORAGE_KEYS.TIMER_START);
    localStorage.removeItem(STORAGE_KEYS.TIMER_ELAPSED);
    onReset();
  }, [onReset]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  }, []);

  return {
    timerState,
    time,
    formattedTime: formatTime(time),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
