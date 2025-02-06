import { supabase } from "@/lib/supabase";
import { APIError } from "@/lib/utils/error";
import type { Customer, Project, TimeEntry } from "@/types";

export class ApiService {
  static async handleError(error: unknown, message: string): Promise<never> {
    console.error(`API Error - ${message}:`, error);
    throw error instanceof APIError ? error : new APIError(message);
  }

  // Customers
  static async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    } catch (error) {
      return this.handleError(error, "Failed to fetch customers");
    }
  }

  // Projects
  static async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          customer:customers(*)
        `,
        )
        .order("name");

      if (error) throw error;
      return data;
    } catch (error) {
      return this.handleError(error, "Failed to fetch projects");
    }
  }

  // Time Entries
  static async getTimeEntries(): Promise<TimeEntry[]> {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select(
          `
          *,
          project:projects(*, customer:customers(*)),
          time_entry_tags (*)
        `,
        )
        .order("start_time", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return this.handleError(error, "Failed to fetch time entries");
    }
  }

  static async createTimeEntry(
    entry: Omit<TimeEntry, "id" | "created_at" | "user_id">,
    tags?: string[],
  ): Promise<TimeEntry> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      const { data: timeEntry, error: timeEntryError } = await supabase
        .from("time_entries")
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (timeEntryError) throw timeEntryError;

      if (tags?.length) {
        const { error: tagsError } = await supabase
          .from("time_entry_tags")
          .insert(tags.map((tag) => ({ time_entry_id: timeEntry.id, tag })));

        if (tagsError) throw tagsError;
      }

      return timeEntry;
    } catch (error) {
      return this.handleError(error, "Failed to create time entry");
    }
  }

  static async deleteTimeEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, "Failed to delete time entry");
    }
  }
}
