import { TimerData, TimerMetadata } from "./types";

export class TimerStorage {
  private static readonly PREFIX = "timer";

  static getKey(userId: string | null): string {
    return `${this.PREFIX}_${userId || "anonymous"}`;
  }

  static getMetadataKey(userId: string | null): string {
    return `${this.PREFIX}_metadata_${userId || "anonymous"}`;
  }

  static save(data: TimerData): void {
    try {
      const key = this.getKey(data.userId);
      localStorage.setItem(
        key,
        JSON.stringify({
          ...data,
          lastUpdated: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Error saving timer data:", error);
    }
  }

  static saveMetadata(userId: string | null, metadata: TimerMetadata): void {
    try {
      const key = this.getMetadataKey(userId);
      localStorage.setItem(key, JSON.stringify(metadata));
    } catch (error) {
      console.error("Error saving timer metadata:", error);
    }
  }

  static load(userId: string | null): TimerData | null {
    try {
      const key = this.getKey(userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading timer data:", error);
      return null;
    }
  }

  static loadMetadata(userId: string | null): TimerMetadata | null {
    try {
      const key = this.getMetadataKey(userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading timer metadata:", error);
      return null;
    }
  }

  static clear(userId: string | null): void {
    try {
      localStorage.removeItem(this.getKey(userId));
      localStorage.removeItem(this.getMetadataKey(userId));
    } catch (error) {
      console.error("Error clearing timer data:", error);
    }
  }

  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing all timer data:", error);
    }
  }
}
