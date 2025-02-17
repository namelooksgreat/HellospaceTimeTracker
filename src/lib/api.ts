import { supabase } from "./supabase";
import { handleError } from "./utils/error-handler";
import { TimeEntry, Project, Customer } from "@/types";

const handleApiRequest = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    handleError(error, "API");
    throw error;
  }
};

export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("time_entries")
      .select(
        `
        *,
        project:projects!left(id, name, color, customer:customers!left(
          id, name, customer_rates(hourly_rate, currency)
        ))
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((entry) => ({
      ...entry,
      project: entry.project
        ? {
            id: entry.project.id,
            name: entry.project.name,
            color: entry.project.color,
            customer: entry.project.customer
              ? {
                  id: entry.project.customer.id,
                  name: entry.project.customer.name,
                  customer_rates: entry.project.customer.customer_rates,
                }
              : undefined,
          }
        : undefined,
    }));
  });
};

export const deleteTimeEntry = async (id: string): Promise<void> => {
  return handleApiRequest(async () => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) throw error;
  });
};

export const getProjects = async (): Promise<Project[]> => {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        customer:customers!left(id, name, customer_rates(hourly_rate, currency))
      `,
      )
      .order("name");

    if (error) throw error;
    return data || [];
  });
};

export const getCustomers = async (): Promise<Customer[]> => {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  });
};
