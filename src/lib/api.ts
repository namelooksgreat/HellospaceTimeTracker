import { supabase } from "./supabase";

export interface Customer {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
  customer_id: string;
  customer?: Customer;
}

export interface TimeEntry {
  id: string;
  task_name: string;
  description?: string;
  duration: number;
  start_time: string;
  project_id?: string;
  user_id: string;
  created_at: string;
  project?: Project;
}

export interface TimeEntryTag {
  id: string;
  time_entry_id: string;
  tag: string;
  created_at: string;
}

// Customers
export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  if (error) throw error;
  return data as Customer[];
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "created_at" | "user_id">,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user");

  const { data, error } = await supabase
    .from("customers")
    .insert([{ ...customer, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

// Projects
export async function getProjects() {
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
  return data as Project[];
}

export async function createProject(
  project: Omit<Project, "id" | "created_at" | "user_id">,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user");

  const { data, error } = await supabase
    .from("projects")
    .insert([{ ...project, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

// Time Entries
export async function getTimeEntries() {
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
  return data as TimeEntry[];
}

export async function createTimeEntry(
  entry: Omit<TimeEntry, "id" | "created_at" | "user_id">,
  tags?: string[],
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user");

  // Start a transaction
  const { data: timeEntry, error: timeEntryError } = await supabase
    .from("time_entries")
    .insert([{ ...entry, user_id: user.id }])
    .select()
    .single();

  if (timeEntryError) throw timeEntryError;

  // If there are tags, insert them
  if (tags && tags.length > 0) {
    const tagObjects = tags.map((tag) => ({
      time_entry_id: timeEntry.id,
      tag,
    }));

    const { error: tagsError } = await supabase
      .from("time_entry_tags")
      .insert(tagObjects);

    if (tagsError) throw tagsError;
  }

  return timeEntry;
}

export async function deleteTimeEntry(id: string) {
  const { error } = await supabase.from("time_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function updateTimeEntry(
  id: string,
  updates: Partial<Omit<TimeEntry, "id" | "created_at" | "user_id">>,
  tags?: string[],
) {
  // Update time entry
  const { data: timeEntry, error: timeEntryError } = await supabase
    .from("time_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (timeEntryError) throw timeEntryError;

  // If tags are provided, update them
  if (tags !== undefined) {
    // First delete existing tags
    const { error: deleteError } = await supabase
      .from("time_entry_tags")
      .delete()
      .eq("time_entry_id", id);

    if (deleteError) throw deleteError;

    // Then insert new tags if any
    if (tags.length > 0) {
      const tagObjects = tags.map((tag) => ({
        time_entry_id: id,
        tag,
      }));

      const { error: insertError } = await supabase
        .from("time_entry_tags")
        .insert(tagObjects);

      if (insertError) throw insertError;
    }
  }

  return timeEntry;
}
