import { useState, useEffect, useCallback, useRef } from "react";

export type TimerState = "stopped" | "running" | "paused";

interface UseTimerProps {
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

export function useTimer({
  onStart = () => {},
  onStop = () => {},
  onReset = () => {},
}: UseTimerProps = {}) {
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Clear interval and timer state
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Effect for handling timer state changes
  useEffect(() => {
    if (timerState === "running") {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
      }, 1000);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [timerState, clearTimer]);

  const start = useCallback(() => {
    setTimerState("running");
    onStart();
  }, [onStart]);

  const pause = useCallback(() => {
    setTimerState("paused");
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setTimerState("running");
  }, []);

  const stop = useCallback(() => {
    setTimerState("stopped");
    clearTimer();
    onStop();
  }, [clearTimer, onStop]);

  const reset = useCallback(() => {
    clearTimer();
    setTimerState("stopped");
    setElapsedTime(0);
    onReset();
  }, [clearTimer, onReset]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")} : ${minutes
      .toString()
      .padStart(2, "0")} : ${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    timerState,
    time: elapsedTime,
    formattedTime: formatTime(elapsedTime),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
