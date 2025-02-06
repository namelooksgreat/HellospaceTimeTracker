import { TimerState } from "./types";

export class TimerManager {
  private static instance: TimerManager;
  private intervals: Map<string, NodeJS.Timeout>;
  private callbacks: Map<string, () => void>;

  private constructor() {
    this.intervals = new Map();
    this.callbacks = new Map();
    this.setupCleanup();
  }

  static getInstance(): TimerManager {
    if (!TimerManager.instance) {
      TimerManager.instance = new TimerManager();
    }
    return TimerManager.instance;
  }

  private setupCleanup(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("unload", () => this.cleanup());
      window.addEventListener("beforeunload", () => this.cleanup());
    }
  }

  startTimer(userId: string, callback: () => void): void {
    // Clear existing timer first
    this.stopTimer(userId);

    // Set new callback
    this.callbacks.set(userId, callback);

    // Create new interval with precise timing
    const startTime = Date.now();
    let expectedTime = startTime + 1000;

    const interval = setInterval(() => {
      const drift = Date.now() - expectedTime;
      if (drift > 1000) {
        // We're way behind, reset expectations
        expectedTime = Date.now() + 1000;
      } else {
        expectedTime += 1000;
      }
      callback();
    }, 1000);

    this.intervals.set(userId, interval);
  }

  stopTimer(userId: string): void {
    const interval = this.intervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(userId);
      this.callbacks.delete(userId);
    }
  }

  cleanup(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.callbacks.clear();
  }

  isRunning(userId: string): boolean {
    return this.intervals.has(userId);
  }

  restartTimer(userId: string): void {
    const callback = this.callbacks.get(userId);
    if (callback) {
      this.startTimer(userId, callback);
    }
  }
}
