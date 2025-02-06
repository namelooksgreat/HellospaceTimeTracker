import { TimerState } from "@/types";

export interface TimerData {
  state: TimerState;
  time: number;
  startTime: string | null;
  mode: "list" | "pomodoro";
}

export class TimerStorage {
  static getStorageKey(userId: string | null): string {
    return `timer_${userId || "anonymous"}`;
  }

  static load(userId: string | null): TimerData | null {
    try {
      const key = this.getStorageKey(userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading timer data:", error);
      return null;
    }
  }

  static save(userId: string | null, data: TimerData): void {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving timer data:", error);
    }
  }

  static clear(userId: string | null): void {
    try {
      const key = this.getStorageKey(userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing timer data:", error);
    }
  }

  static calculateElapsedTime(
    startTime: string | null,
    savedTime: number,
  ): number {
    if (!startTime) return savedTime;

    try {
      const now = Date.now();
      const start = new Date(startTime).getTime();
      return Math.floor((now - start) / 1000);
    } catch (error) {
      console.error("Error calculating elapsed time:", error);
      return savedTime;
    }
  }
}
