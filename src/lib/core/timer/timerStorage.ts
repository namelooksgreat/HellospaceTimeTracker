import { TimerState } from "@/types/timer";

export interface TimerStorageData {
  state: TimerState;
  time: number;
  startTime: string | null;
  taskName?: string;
  projectId?: string;
  customerId?: string;
}

export class TimerStorage {
  private static readonly STORAGE_KEY = "timer_state";

  static save(data: TimerStorageData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving timer state:", error);
    }
  }

  static load(): TimerStorageData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as TimerStorageData;

      // Validate stored time
      if (parsed.state === "running" && parsed.startTime) {
        const now = Date.now();
        const start = new Date(parsed.startTime).getTime();
        if (!isNaN(start)) {
          const elapsed = Math.floor((now - start) / 1000);
          return { ...parsed, time: parsed.time + elapsed };
        }
      }

      return parsed;
    } catch (error) {
      console.error("Error loading timer state:", error);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing timer state:", error);
    }
  }
}
