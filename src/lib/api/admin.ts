import { supabase } from "../supabase";
import { handleError } from "../utils/error-handler";

// Kullanıcıları getir
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "getUsers");
    return [];
  }
}

// Müşterileri getir
export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*, projects(count)")
      .order("name");

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "getCustomers");
    return [];
  }
}

// Projeleri getir
export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        customers (id, name),
        time_entries (count)
      `,
      )
      .order("name");

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "getProjects");
    return [];
  }
}

// Zaman kayıtlarını getir
export async function getTimeEntries() {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .select(
        `
        *,
        users (id, email, full_name),
        projects (id, name, color, customers (id, name))
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "getTimeEntries");
    return [];
  }
}

// İstatistikleri getir
export async function getDashboardStats() {
  try {
    const [users, customers, projects, timeEntries] = await Promise.all([
      supabase.from("users").select("count").single(),
      supabase.from("customers").select("count").single(),
      supabase.from("projects").select("count").single(),
      supabase.from("time_entries").select("count").single(),
    ]);

    return {
      users: users.data?.count || 0,
      customers: customers.data?.count || 0,
      projects: projects.data?.count || 0,
      timeEntries: timeEntries.data?.count || 0,
    };
  } catch (error) {
    handleError(error, "getDashboardStats");
    return {
      users: 0,
      customers: 0,
      projects: 0,
      timeEntries: 0,
    };
  }
}
