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
  const calculateEarnings = async (entries: any[]) => {
    if (!entries.length) return 0;

    // Get unique user IDs from entries
    const userIds = [...new Set(entries.map((entry) => entry.user_id))];

    // Fetch all developer rates at once
    const { data: developerRates } = await supabase
      .from("developer_rates")
      .select("user_id, hourly_rate")
      .in("user_id", userIds);

    // Create a map of user_id to hourly_rate for quick lookup
    const rateMap = (developerRates || []).reduce(
      (acc, rate) => {
        acc[rate.user_id] = rate.hourly_rate;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate total earnings
    return entries.reduce((total, entry) => {
      const hours = entry.duration / 3600;
      const customerRate =
        entry.project?.customer?.customer_rates?.[0]?.hourly_rate;

      if (customerRate) {
        return total + customerRate * hours;
      }

      const developerRate = rateMap[entry.user_id];
      if (developerRate) {
        return total + developerRate * hours;
      }

      return total;
    }, 0);
  };
  try {
    const [users, customers, projects, timeEntries, monthlyEntries] =
      await Promise.all([
        supabase.from("users").select("count").single(),
        supabase.from("customers").select("count").single(),
        supabase.from("projects").select("count").single(),
        supabase.from("time_entries").select("count").single(),
        supabase
          .from("time_entries")
          .select(
            `
          *,
          project:projects!left(id, name, color, customer:customers!left(id, name, customer_rates(hourly_rate, currency)))
        `,
          )
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1,
            ).toISOString(),
          )
          .lte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0,
            ).toISOString(),
          )
          .order("created_at", { ascending: false }),
      ]);

    if (timeEntries.error) throw timeEntries.error;
    if (monthlyEntries.error) throw monthlyEntries.error;

    // Calculate today's hours
    let todayHours = 0;

    const todayEntries = (monthlyEntries.data || []).filter((entry) => {
      const entryDate = new Date(entry.created_at);
      const today = new Date();
      return (
        entryDate.getDate() === today.getDate() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    });

    todayEntries.forEach((entry) => {
      todayHours += entry.duration / 3600; // Convert seconds to hours
    });

    // Calculate monthly earnings using the calculateEarnings function
    const monthlyEarnings = await calculateEarnings(monthlyEntries.data || []);

    return {
      users: users.data?.count || 0,
      customers: customers.data?.count || 0,
      projects: projects.data?.count || 0,
      timeEntries: timeEntries.data?.count || 0,
      recentEntries: monthlyEntries.data?.slice(0, 5) || [],
      todayHours,
      monthlyEarnings,
      totalEntries: monthlyEntries.data?.length || 0,
    };
  } catch (error) {
    handleError(error, "getDashboardStats");
    return {
      users: 0,
      customers: 0,
      projects: 0,
      timeEntries: 0,
      recentEntries: [],
      todayHours: 0,
      monthlyEarnings: 0,
      totalEntries: 0,
    };
  }
}
