export type TimerState = "stopped" | "running" | "paused";

export interface TimerData {
  state: TimerState;
  time: number;
  startTime: string | null;
  lastUpdated: string;
  userId: string | null;
}

export interface TimerMetadata {
  taskName?: string;
  projectId?: string;
  customerId?: string;
}
