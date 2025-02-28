import { useState, useEffect, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { handleError } from "@/lib/utils/error-handler";
import { getProjects, getCustomers } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useTimerStore } from "@/store/timerStore";
import { useTimerDataStore } from "@/store/timerDataStore";
import type { Project, Customer, TimeEntry } from "@/types";

export function useHomeData(session: Session | null): {
  projects: Project[];
  customers: Customer[];
  timeEntries: TimeEntry[];
  loading: boolean;
  fetchTimeEntriesData: () => Promise<void>;
} {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeEntriesData = useCallback(async () => {
    if (!session) return;
    try {
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
      setTimeEntries(data || []);

      // Update timer data store with latest values
      try {
        const { data: timerState } = await supabase
          .from("timer_states")
          .select("*")
          .eq("user_id", session?.user?.id)
          .maybeSingle();

        if (timerState) {
          useTimerStore.setState({ state: timerState.state || "stopped" });
          useTimerStore.setState({ time: timerState.time || 0 });
          useTimerDataStore.getState().setTaskName(timerState.task_name || "");
          useTimerDataStore
            .getState()
            .setProjectId(timerState.project_id || "");
          useTimerDataStore
            .getState()
            .setCustomerId(timerState.customer_id || "");
        }
      } catch (timerError) {
        // Silently handle timer state errors to prevent breaking the main functionality
        console.warn("Error fetching timer state:", timerError);
      }
    } catch (error) {
      handleError(error, "useHomeData");
      setTimeEntries([]);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const [projectsData, customersData, { data: timeEntriesData, error }] =
          await Promise.all([
            getProjects(),
            getCustomers(),
            supabase
              .from("time_entries")
              .select(
                `
              *,
              project:projects!left(id, name, color, customer:customers!left(
                id, name, customer_rates(hourly_rate, currency)
              ))
            `,
              )
              .order("created_at", { ascending: false }),
          ]);

        if (error) throw error;

        setProjects(projectsData || []);
        setCustomers(customersData || []);
        setTimeEntries(timeEntriesData || []);
      } catch (error) {
        handleError(error, "useHomeData");
        setProjects([]);
        setCustomers([]);
        setTimeEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  return {
    projects,
    customers,
    timeEntries,
    loading,
    fetchTimeEntriesData,
  };
}
