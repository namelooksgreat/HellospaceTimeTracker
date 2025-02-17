import { supabase } from "../supabase";
import { handleError } from "../utils/error-handler";
import { TimeEntry } from "@/types";

export async function createTimeEntry(data: {
  task_name: string;
  project_id?: string | null;
  duration: number;
  start_time: string;
  description?: string;
}): Promise<TimeEntry> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    const timeEntryData = {
      ...data,
      user_id: user.id,
    };

    const { data: timeEntry, error: timeEntryError } = await supabase
      .from("time_entries")
      .insert([timeEntryData])
      .select()
      .single();

    if (timeEntryError) throw timeEntryError;
    return timeEntry;
  } catch (error) {
    handleError(error, "createTimeEntry");
    throw error;
  }
}
