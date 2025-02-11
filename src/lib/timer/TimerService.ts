import { supabase } from "../supabase";
import { TimerState } from "./types";

export class TimerService {
  private static instance: TimerService;
  private intervals: Map<string, NodeJS.Timeout>;
  private syncIntervals: Map<string, NodeJS.Timeout>;
  private lastSyncTimes: Map<string, number>;
  private readonly SYNC_INTERVAL = 1000; // 1 second

  private constructor() {
    this.intervals = new Map();
    this.syncIntervals = new Map();
    this.lastSyncTimes = new Map();
  }

  static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  async startTimer(userId: string, data: TimerData): Promise<void> {
    this.stopTimer(userId);
    await this.saveTimerState(userId, data);
    this.setupSyncInterval(userId, data);
  }

  private setupSyncInterval(userId: string, initialData: TimerData): void {
    const syncInterval = setInterval(async () => {
      const now = Date.now();
      const lastSync = this.lastSyncTimes.get(userId) || 0;

      if (now - lastSync >= this.SYNC_INTERVAL) {
        try {
          await this.saveTimerState(userId, initialData);
          this.lastSyncTimes.set(userId, now);
        } catch (error) {
          console.error("Timer sync failed:", error);
        }
      }
    }, this.SYNC_INTERVAL);

    this.syncIntervals.set(userId, syncInterval);
  }

  private async saveTimerState(userId: string, data: TimerData): Promise<void> {
    try {
      const { error } = await supabase.from("timer_states").upsert({
        user_id: userId,
        ...data,
        last_synced: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Timer sync failed:", error);
    }
  }

  stopTimer(userId: string): void {
    const interval = this.intervals.get(userId);
    const syncInterval = this.syncIntervals.get(userId);

    if (interval) {
      clearInterval(interval);
      this.intervals.delete(userId);
    }

    if (syncInterval) {
      clearInterval(syncInterval);
      this.syncIntervals.delete(userId);
    }

    this.lastSyncTimes.delete(userId);
  }

  async setupRealtimeSync(
    userId: string,
    onUpdate: (data: any) => void,
  ): Promise<void> {
    const channel = supabase
      .channel(`timer_states:user_id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timer_states",
          filter: `user_id=eq.${userId}`,
        },
        onUpdate,
      )
      .subscribe();
    return Promise.resolve();
  }

  cleanup(): void {
    this.intervals.forEach(clearInterval);
    this.syncIntervals.forEach(clearInterval);
    this.intervals.clear();
    this.syncIntervals.clear();
    this.lastSyncTimes.clear();
  }
}

interface TimerData {
  state: TimerState;
  time: number;
  start_time: string | null;
  task_name?: string;
  project_id?: string;
  customer_id?: string;
}
