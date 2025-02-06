import { TimerState } from "./types";

export class UserTimer {
  private static readonly STORAGE_PREFIX = "user_timer_";
  private static readonly USER_DATA_PREFIX = "user_data_";

  static getStorageKey(userId: string): string {
    return `${this.STORAGE_PREFIX}${userId}`;
  }

  static getUserDataKey(userId: string): string {
    return `${this.USER_DATA_PREFIX}${userId}`;
  }

  static saveTimer(
    userId: string,
    data: {
      state: TimerState;
      time: number;
      startTime: string | null;
      taskName?: string;
      projectId?: string;
      customerId?: string;
    },
  ): void {
    if (!userId || userId === "anonymous") return;

    try {
      const storageKey = this.getStorageKey(userId);
      const storageData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        userId,
      };
      localStorage.setItem(storageKey, JSON.stringify(storageData));

      // Save user preferences separately
      if (data.taskName || data.projectId || data.customerId) {
        this.saveUserData(userId, {
          taskName: data.taskName,
          projectId: data.projectId,
          customerId: data.customerId,
        });
      }
    } catch (error) {
      console.error("Error saving timer:", error);
    }
    try {
      const storageData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        this.getStorageKey(userId),
        JSON.stringify(storageData),
      );
    } catch (error) {
      console.error("Error saving timer:", error);
    }
  }

  static loadTimer(userId: string): {
    state: TimerState;
    time: number;
    startTime: string | null;
    taskName?: string;
    projectId?: string;
    customerId?: string;
  } | null {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      if (!data) return null;

      const parsedData = JSON.parse(data);
      const { state, time, startTime } = parsedData;

      // If timer was running, calculate elapsed time
      if (state === "running" && startTime) {
        const elapsed = this.calculateElapsedTime(startTime, time);
        return { state, time: elapsed, startTime };
      }

      return { state, time, startTime };
    } catch (error) {
      console.error("Error loading timer:", error);
      return null;
    }
  }

  static clearTimer(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
      localStorage.removeItem(this.getUserDataKey(userId));
    } catch (error) {
      console.error("Error clearing timer:", error);
    }
  }

  static saveUserData(
    userId: string,
    data: {
      taskName?: string;
      projectId?: string;
      customerId?: string;
    },
  ): void {
    try {
      localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  static loadUserData(userId: string): {
    taskName?: string;
    projectId?: string;
    customerId?: string;
  } | null {
    try {
      const data = localStorage.getItem(this.getUserDataKey(userId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
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
      // Only count full seconds to avoid drift
      const elapsedSeconds = Math.floor((now - start) / 1000);
      return elapsedSeconds;
    } catch (error) {
      console.error("Error calculating elapsed time:", error);
      return savedTime;
    }
  }
}
