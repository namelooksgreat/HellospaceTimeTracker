export type TimerState = "stopped" | "running" | "paused" | "break";
export type TimerMode = "list" | "pomodoro";
export type PomodoroMode = "classic" | "long" | "short";

export interface TimerData {
  state: TimerState;
  time: number;
  startTime: string | null;
  mode: TimerMode;
  pomodoroMode?: PomodoroMode;
  taskName?: string;
  projectId?: string;
  customerId?: string;
}

export interface TimerError extends Error {
  code?: string;
  context?: Record<string, unknown>;
}
