import { TimerState } from "@/types";

interface TimerData {
  state: TimerState;
  time: number;
  startTime: string | null;
  taskName?: string;
  projectId?: string;
  customerId?: string;
}

const STORAGE_KEY = "timer_state";
const SYNC_INTERVAL = 100; // More frequent updates for better accuracy

export class TimerService {
  private static instance: TimerService;
  private interval: NodeJS.Timeout | null = null;
  private lastUpdate: number = Date.now();

  private constructor() {}

  static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  loadState(): TimerData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const parsedData = JSON.parse(data) as TimerData;

      // Handle running timer state
      if (parsedData.state === "running" && parsedData.startTime) {
        const now = Date.now();
        const start = new Date(parsedData.startTime).getTime();
        if (!isNaN(start)) {
          const elapsed = Math.floor((now - start) / 1000);
          return { ...parsedData, time: parsedData.time + elapsed };
        }
      }

      return parsedData;
    } catch (error) {
      console.error("Error loading timer state:", error);
      return null;
    }
  }

  saveState(data: TimerData): void {
    if (!this.validateTimerData(data)) return;

    try {
      const sanitizedData = this.sanitizeTimerData(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedData));
    } catch (error) {
      console.error("Error saving timer state:", error);
      this.handleStorageError();
    }
  }

  startInterval(callback: () => void): void {
    this.stopInterval();
    this.lastUpdate = Date.now();

    this.interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - this.lastUpdate) / 1000);

      if (elapsed > 0) {
        callback();
        this.lastUpdate = now;
      }
    }, SYNC_INTERVAL);
  }

  stopInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  cleanup(): void {
    this.stopInterval();
  }

  private validateTimerData(data: TimerData): boolean {
    if (!data || typeof data.time !== "number" || !data.state) {
      console.error("Invalid timer data:", data);
      return false;
    }

    if (!["stopped", "running", "paused"].includes(data.state)) {
      console.error("Invalid timer state:", data.state);
      return false;
    }

    if (data.time < 0) {
      console.error("Invalid timer value:", data.time);
      return false;
    }

    return true;
  }

  private sanitizeTimerData(data: TimerData): TimerData {
    return {
      state: data.state,
      time: Math.max(0, Math.floor(data.time)),
      startTime: data.startTime ? new Date(data.startTime).toISOString() : null,
      taskName: data.taskName?.trim(),
      projectId: data.projectId,
      customerId: data.customerId,
    };
  }

  private handleStorageError(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.stopInterval();
    } catch (error) {
      console.error("Critical storage error:", error);
    }
  }
}

export const timerService = TimerService.getInstance();
