import { STORAGE_CONSTANTS } from "../constants/storage";

export interface TimerData {
  taskName: string;
  projectId: string;
  customerId: string;
}

export class TimerStorageService {
  private static readonly STORAGE_KEY = STORAGE_CONSTANTS.TIMER.KEY;

  static saveTimerData(data: TimerData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

      // Dispatch custom event for same-window updates
      window.dispatchEvent(
        new CustomEvent("timerDataUpdate", {
          detail: data,
        }),
      );
    } catch (error) {
      console.error("Error saving timer data:", error);
    }
  }

  static getTimerData(): TimerData {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return this.getDefaultData();

      const data = JSON.parse(saved);
      return {
        taskName: data.taskName || "",
        projectId: data.projectId || "",
        customerId: data.customerId || "",
      };
    } catch (error) {
      console.error("Error loading timer data:", error);
      return this.getDefaultData();
    }
  }

  static clearTimerData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing timer data:", error);
    }
  }

  private static getDefaultData(): TimerData {
    return {
      taskName: "",
      projectId: "",
      customerId: "",
    };
  }
}
