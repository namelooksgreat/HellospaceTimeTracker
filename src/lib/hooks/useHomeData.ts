import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { handleError } from "@/lib/utils/error-handler";
import { getProjects, getTimeEntries, getCustomers } from "@/lib/api";
import type { Project, Customer, TimeEntry } from "@/types";

export function useHomeData(session: Session | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeEntriesData = async () => {
    if (!session) return;
    try {
      const timeEntriesData = await getTimeEntries();
      if (Array.isArray(timeEntriesData)) {
        setTimeEntries(timeEntriesData);
      } else {
        handleError(
          new Error("Invalid time entries data format"),
          "useHomeData",
        );
        setTimeEntries([]);
      }
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
        const [projectsData, customersData, timeEntriesData] =
          await Promise.all([getProjects(), getCustomers(), getTimeEntries()]);

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
