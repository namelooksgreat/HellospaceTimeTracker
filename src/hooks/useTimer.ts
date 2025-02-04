import { useState, useEffect, useCallback } from "react";
import { POMODORO_DURATIONS } from "@/lib/constants";

export type TimerState = "stopped" | "running" | "paused" | "break";
export type TimerMode = "list" | "pomodoro";
export type PomodoroMode = "classic" | "long" | "short";

interface UseTimerProps {
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  initialMode?: TimerMode;
  initialPomodoroMode?: PomodoroMode;
}

export function useTimer({
  onStart = () => {},
  onStop = () => {},
  onReset = () => {},
  initialMode = "list",
  initialPomodoroMode = "classic",
}: UseTimerProps = {}) {
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [timerMode, setTimerMode] = useState<TimerMode>(initialMode);
  const [pomodoroMode, setPomodoroMode] =
    useState<PomodoroMode>(initialPomodoroMode);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [time, setTime] = useState(0);

  const getPomodoroTime = useCallback(() => {
    return POMODORO_DURATIONS[pomodoroMode][isBreakTime ? "break" : "work"];
  }, [pomodoroMode, isBreakTime]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")} : ${minutes
      .toString()
      .padStart(2, "0")} : ${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    let startTime: number;

    if (timerState === "running") {
      startTime = Date.now();
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTime((prevTime) => {
          const newTime = prevTime + elapsed;
          if (timerMode === "pomodoro" && newTime >= getPomodoroTime()) {
            setIsBreakTime(!isBreakTime);
            setTime(0);
            return 0;
          }
          return newTime;
        });
        startTime = Date.now();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, timerMode, getPomodoroTime, isBreakTime]);

  const start = useCallback(() => {
    setTimerState("running");
    onStart();
  }, [onStart]);

  const pause = useCallback(() => {
    setTimerState("paused");
  }, []);

  const resume = useCallback(() => {
    setTimerState("running");
  }, []);

  const stop = useCallback(() => {
    setTimerState("stopped");
    onStop();
  }, [onStop]);

  const reset = useCallback(() => {
    setTime(0);
    setTimerState("stopped");
    setIsBreakTime(false);
    onReset();
  }, [onReset]);

  return {
    timerState,
    timerMode,
    pomodoroMode,
    isBreakTime,
    time,
    formattedTime: formatTime(time),
    setTimerMode,
    setPomodoroMode,
    start,
    pause,
    resume,
    stop,
    reset,
    getPomodoroTime,
  };
}
