import { supabase } from "@/lib/supabase";
import { TimerState } from "@/types/timer";

interface TimerSyncData {
  state: TimerState;
  time: number;
  startTime: string | null;
  taskName?: string;
  projectId?: string;
  customerId?: string;
}

export class TimerSync {
  private static readonly TABLE_NAME = "timer_states";

  static async saveState(userId: string, data: TimerSyncData): Promise<void> {
    try {
      const { error } = await supabase.from(this.TABLE_NAME).upsert({
        user_id: userId,
        state: data.state,
        time: data.time,
        start_time: data.startTime,
        task_name: data.taskName,
        project_id: data.projectId,
        customer_id: data.customerId,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error syncing timer state:", error);
      throw error;
    }
  }

  static async loadState(userId: string): Promise<TimerSyncData | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No data found
        throw error;
      }

      return data
        ? {
            state: data.state,
            time: data.time,
            startTime: data.start_time,
            taskName: data.task_name,
            projectId: data.project_id,
            customerId: data.customer_id,
          }
        : null;
    } catch (error) {
      console.error("Error loading timer state:", error);
      throw error;
    }
  }

  static async clearState(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error clearing timer state:", error);
      throw error;
    }
  }
}
