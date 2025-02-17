import { supabase } from "../supabase";
import { handleError } from "../utils/error-handler";

export async function createTimeEntry(data: {
  task_name: string;
  project_id?: string | null;
  duration: number;
  start_time: string;
  description?: string;
}) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    // Add user_id to the data
    const timeEntryData = {
      ...data,
      user_id: user.id,
    };

    // Create time entry with the specified start_time
    const { data: timeEntry, error: timeEntryError } = await supabase
      .from("time_entries")
      .insert([timeEntryData])
      .select()
      .single();

    if (timeEntryError) throw timeEntryError;

    // If project ID exists, find the customer
    if (timeEntry.project_id) {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select(
          `
          customer_id,
          customers!inner (id, customer_rates!inner(hourly_rate))
        `,
        )
        .eq("id", timeEntry.project_id)
        .single();

      if (projectError) throw projectError;

      if (
        project?.customer_id &&
        project?.customers?.length &&
        project.customers[0]?.customer_rates?.length &&
        project.customers[0].customer_rates[0]?.hourly_rate
      ) {
        const hourlyRate = project.customers[0].customer_rates[0].hourly_rate;
        const hours = timeEntry.duration / 3600; // Convert seconds to hours
        const amount = hours * hourlyRate;

        if (amount > 0) {
          // Update customer balance
          const { error: balanceError } = await supabase.rpc(
            "update_customer_total_amount",
            {
              p_customer_id: project.customer_id,
              p_amount: amount,
            },
          );

          if (balanceError) throw balanceError;
        }
      }
    }

    return timeEntry;
  } catch (error) {
    handleError(error, "createTimeEntry");
    throw error;
  }
}
