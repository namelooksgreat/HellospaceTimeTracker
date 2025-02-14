import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { handleError } from "@/lib/utils/error-handler";
import { getProjects, getCustomers } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Project, Customer, TimeEntry } from "@/types";

export function useHomeData(session: Session | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeEntriesData = async () => {
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
    } catch (error) {
      handleError(error, "useHomeData");
      setTimeEntries([]);
    }
  };

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
