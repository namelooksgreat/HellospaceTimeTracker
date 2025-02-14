import { TimerState } from "@/types/timer";

export class TimerManager {
  private static instance: TimerManager;
  private intervals: Map<string, NodeJS.Timeout>;

  private constructor() {
    this.intervals = new Map();
  }

  static getInstance(): TimerManager {
    if (!TimerManager.instance) {
      TimerManager.instance = new TimerManager();
    }
    return TimerManager.instance;
  }

  startInterval(userId: string, callback: () => void): void {
    this.stopInterval(userId);
    const interval = setInterval(callback, 1000);
    this.intervals.set(userId, interval);
  }

  stopInterval(userId: string): void {
    const interval = this.intervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(userId);
    }
  }

  cleanup(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }
}

// Add cleanup listener with visibilitychange
if (typeof window !== "undefined") {
  const timerManager = TimerManager.getInstance();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      timerManager.cleanup();
    }
  });
}
