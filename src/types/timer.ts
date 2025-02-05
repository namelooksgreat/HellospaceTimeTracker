export type TimerState = "stopped" | "running" | "paused" | "break";
export type TimerMode = "list" | "pomodoro";
export type PomodoroMode = "classic" | "long" | "short";

export interface TimerData {
  state: TimerState;
  time: number;
  startTime: string | null;
  mode: TimerMode;
  pomodoroMode?: PomodoroMode;
}

export interface TimeEntry {
  id: string;
  taskName: string;
  projectName: string;
  duration: number;
  startTime: string;
  createdAt: string;
  projectColor: string;
  description?: string;
  projectId?: string;
  tags?: string[];
}
