import { supabase } from "./supabase";
import { handleApiRequest } from "./utils/api";
import { APIError } from "./utils/error";
import type { Customer, Project, TimeEntry } from "@/types";

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

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
    return data || [];
  }, "Failed to fetch projects");
}

type RawTimeEntryProject = {
  id: string;
  name: string;
  color: string;
  customer_id: string;
};

type RawTimeEntry = {
  id: string;
  task_name: string;
  description?: string;
  duration: number | string;
  start_time: string;
  created_at: string;
  user_id: string;
  project: RawTimeEntryProject | null;
};

// Time Entries
export async function getTimeEntries(): Promise<TimeEntry[]> {
  return handleApiRequest(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError)
      throw new APIError("Authentication failed", userError.message);
    if (!user) throw new APIError("No authenticated user");

    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from("time_entries")
      .select(
        `
        id,
        task_name,
        description,
        duration,
        start_time,
        created_at,
        user_id,
        project:projects!left(id, name, color, customer_id)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (timeEntriesError) {
      throw new APIError(
        "Failed to fetch time entries",
        timeEntriesError.message,
      );
    }

    if (!Array.isArray(timeEntries)) {
      console.error("Invalid time entries response:", timeEntries);
      return [];
    }

    return (timeEntries as unknown as RawTimeEntry[]).map((entry) => ({
      ...entry,
      duration:
        typeof entry.duration === "string"
          ? parseInt(entry.duration)
          : entry.duration,
      start_time: entry.start_time
        ? new Date(entry.start_time).toISOString()
        : new Date().toISOString(),
      created_at: entry.created_at
        ? new Date(entry.created_at).toISOString()
        : new Date().toISOString(),
      project: entry.project
        ? {
            id: entry.project.id,
            name: entry.project.name,
            color: entry.project.color || "#94A3B8",
            customer_id: entry.project.customer_id,
          }
        : null,
    }));
  }, "Failed to fetch time entries");
}

export async function createTimeEntry(
  entry: Omit<TimeEntry, "id" | "created_at" | "user_id">,
): Promise<TimeEntry> {
  return handleApiRequest(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError)
      throw new APIError("Authentication failed", userError.message);
    if (!user) throw new APIError("No authenticated user");

    const { data, error } = await supabase
      .from("time_entries")
      .insert([{ ...entry, user_id: user.id }])
      .select()
      .single();

    if (error) throw new APIError("Failed to create time entry", error.message);
    if (!data) throw new APIError("No data returned from time entry creation");

    return data;
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
  data: {
    task_name: string;
    project_id?: string | null;
    description?: string;
  },
): Promise<TimeEntry> {
  return handleApiRequest(async () => {
    const { data: updated, error } = await supabase
      .from("time_entries")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new APIError("Failed to update time entry", error.message);
    if (!updated) throw new APIError("No data returned from time entry update");

    return updated;
  }, "Failed to update time entry");
}

export type { Customer, Project, TimeEntry };
