export class TimerPersistence {
  private static readonly STORAGE_KEY = "timer_state";
  private static readonly SYNC_INTERVAL = 5000; // 5 seconds
  private static readonly BROADCAST_CHANNEL = "timer_sync";

  private channel: BroadcastChannel | null = null;
  private lastSyncTime: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.channel = new BroadcastChannel(TimerPersistence.BROADCAST_CHANNEL);
        this.setupBroadcastChannel();
      } catch (error) {
        console.warn("BroadcastChannel not supported:", error);
      }
    }
  }

  private setupBroadcastChannel() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === "timer_update") {
        this.saveToStorage(data, false); // Don't broadcast again
      }
    };
  }

  saveToStorage(data: TimerState, broadcast: boolean = true) {
    try {
      const now = Date.now();
      if (now - this.lastSyncTime >= TimerPersistence.SYNC_INTERVAL) {
        localStorage.setItem(
          TimerPersistence.STORAGE_KEY,
          JSON.stringify(data),
        );
        this.lastSyncTime = now;

        if (broadcast && this.channel) {
          this.channel.postMessage({ type: "timer_update", data });
        }
      }
    } catch (error) {
      console.error("Error saving timer state:", error);
    }
  }

  loadFromStorage(): TimerState | null {
    try {
      const data = localStorage.getItem(TimerPersistence.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading timer state:", error);
      return null;
    }
  }

  clearStorage() {
    try {
      localStorage.removeItem(TimerPersistence.STORAGE_KEY);
      if (this.channel) {
        this.channel.postMessage({ type: "timer_update", data: null });
      }
    } catch (error) {
      console.error("Error clearing timer state:", error);
    }
  }

  cleanup() {
    this.channel?.close();
  }
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  taskName?: string;
  projectId?: string;
}

export const timerPersistence = new TimerPersistence();
