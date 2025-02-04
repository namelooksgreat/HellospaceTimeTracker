import { supabase } from "./supabase";
import { handleApiRequest } from "./utils/api";
import { APIError } from "./utils/error";
import type { Customer, Project, TimeEntry, TimeEntryTag, User } from "./types";

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return handleApiRequest(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError)
      throw new APIError("Authentication failed", userError.message);
    if (!user) throw new APIError("No authenticated user");

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw new APIError("Failed to fetch customers", error.code);
    return data || [];
  }, "Failed to fetch customers");
}

// Projects
export async function getProjects(): Promise<Project[]> {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select(`*, customer:customers(*)`)
      .order("name");

    if (error) throw new APIError("Failed to fetch projects", error.code);
    return data;
  }, "Failed to fetch projects");
}

// Time Entries
export async function getTimeEntries(): Promise<TimeEntry[]> {
  return handleApiRequest(async () => {
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

    if (error) throw new APIError("Failed to fetch time entries", error.code);
    return data;
  }, "Failed to fetch time entries");
}

export async function createTimeEntry(
  entry: Omit<TimeEntry, "id" | "created_at" | "user_id">,
  tags?: string[],
): Promise<TimeEntry> {
  return handleApiRequest(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError)
      throw new APIError("Authentication failed", userError.message);
    if (!user) throw new APIError("No authenticated user");

    const { data: timeEntry, error: timeEntryError } = await supabase
      .from("time_entries")
      .insert([{ ...entry, user_id: user.id }])
      .select()
      .single();

    if (timeEntryError)
      throw new APIError("Failed to create time entry", timeEntryError.message);

    if (tags?.length) {
      const { error: tagsError } = await supabase
        .from("time_entry_tags")
        .insert(tags.map((tag) => ({ time_entry_id: timeEntry.id, tag })));

      if (tagsError)
        throw new APIError("Failed to create tags", tagsError.message);
    }

    return timeEntry;
  }, "Failed to create time entry");
}

export async function deleteTimeEntry(id: string): Promise<void> {
  return handleApiRequest(async () => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) throw new APIError("Failed to delete time entry", error.message);
  }, "Failed to delete time entry");
}

export async function updateTimeEntry(
  id: string,
  updates: Partial<Omit<TimeEntry, "id" | "created_at" | "user_id">>,
  tags?: string[],
): Promise<TimeEntry> {
  return handleApiRequest(async () => {
    const { data: timeEntry, error: timeEntryError } = await supabase
      .from("time_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (timeEntryError)
      throw new APIError("Failed to update time entry", timeEntryError.message);

    if (tags !== undefined) {
      const { error: deleteError } = await supabase
        .from("time_entry_tags")
        .delete()
        .eq("time_entry_id", id);

      if (deleteError)
        throw new APIError(
          "Failed to delete existing tags",
          deleteError.message,
        );

      if (tags.length > 0) {
        const { error: insertError } = await supabase
          .from("time_entry_tags")
          .insert(tags.map((tag) => ({ time_entry_id: id, tag })));

        if (insertError)
          throw new APIError("Failed to insert new tags", insertError.message);
      }
    }

    return timeEntry;
  }, "Failed to update time entry");
}

// User Management
export async function getUsers(): Promise<User[]> {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at");

    if (error) throw new APIError("Failed to fetch users", error.message);
    return data;
  }, "Failed to fetch users");
}

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<void> {
  return handleApiRequest(async () => {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId);

    if (error) throw new APIError("Failed to update user role", error.message);
  }, "Failed to update user role");
}
