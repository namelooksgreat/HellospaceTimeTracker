export interface Customer {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
  customer_id: string;
  customer?: Customer;
}

export interface TimeEntry {
  id: string;
  task_name: string;
  description?: string;
  duration: number;
  start_time: string;
  created_at: string;
  user_id: string;
  project?: {
    id: string;
    name: string;
    color: string;
    customer_id: string;
  } | null;
}

export interface TimeEntryTag {
  id: string;
  time_entry_id: string;
  tag: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  created_at: string;
}

export type TimerState = "stopped" | "running" | "paused" | "break";
export type TimerMode = "list" | "pomodoro";
export type PomodoroMode = "classic" | "long" | "short";
