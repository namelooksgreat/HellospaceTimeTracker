import { supabase } from "../supabase";
import { TimerState } from "./types";

export class SupabaseTimer {
  static async saveTimer(
    userId: string,
    data: {
      state: TimerState;
      time: number;
      start_time: string | null;
      task_name?: string;
      project_id?: string;
      customer_id?: string;
    },
  ): Promise<void> {
    try {
      const { error: existingError, data: existingTimer } = await supabase
        .from("timer_states")
        .select()
        .eq("user_id", userId)
        .single();

      if (existingTimer) {
        const { error } = await supabase
          .from("timer_states")
          .update({
            state: data.state,
            time: data.time,
            start_time: data.start_time,
            task_name: data.task_name,
            project_id: data.project_id,
            customer_id: data.customer_id,
            last_synced: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("timer_states").insert([
          {
            user_id: userId,
            state: data.state,
            time: data.time,
            start_time: data.start_time,
            task_name: data.task_name,
            project_id: data.project_id,
            customer_id: data.customer_id,
            last_synced: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving timer to Supabase:", error);
    }
  }

  static async loadTimer(userId: string) {
    try {
      const { data, error } = await supabase
        .from("timer_states")
        .select()
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error loading timer from Supabase:", error);
      return null;
    }
  }

  static async clearTimer(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("timer_states")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error clearing timer from Supabase:", error);
    }
  }

  static async setupRealtimeSubscription(
    userId: string,
    onUpdate: (payload: any) => void,
  ) {
    return supabase
      .channel(`timer_states:user_id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timer_states",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onUpdate(payload),
      )
      .subscribe();
  }
}
