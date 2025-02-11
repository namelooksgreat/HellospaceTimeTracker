export class TimerSync {
  private static readonly STORAGE_KEY = "timer_state";
  private static readonly BROADCAST_CHANNEL = "timer_sync";
  private channel: BroadcastChannel | null = null;
  private onStateChange: ((state: TimerState) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.channel = new BroadcastChannel(TimerSync.BROADCAST_CHANNEL);
        this.setupChannel();
        window.addEventListener("storage", this.handleStorageChange);
      } catch (error) {
        console.warn("BroadcastChannel not supported:", error);
      }
    }
  }

  private setupChannel() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const state = event.data as TimerState;
      this.onStateChange?.(state);
    };
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === TimerSync.STORAGE_KEY) {
      const state = event.newValue ? JSON.parse(event.newValue) : null;
      this.onStateChange?.(state);
    }
  };

  setOnStateChange(callback: (state: TimerState) => void) {
    this.onStateChange = callback;
  }

  broadcastState(state: TimerState) {
    if (this.channel) {
      this.channel.postMessage(state);
    }
    localStorage.setItem(TimerSync.STORAGE_KEY, JSON.stringify(state));
  }

  loadState(): TimerState | null {
    const stored = localStorage.getItem(TimerSync.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  cleanup() {
    this.channel?.close();
    window.removeEventListener("storage", this.handleStorageChange);
  }
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  taskName?: string;
  projectId?: string;
}

export const timerSync = new TimerSync();
