import { useState, useCallback } from "react";
import { TimeEntry } from "@/lib/api";
import { createTimeEntry, deleteTimeEntry, getTimeEntries } from "@/lib/api";
import { handleApiError } from "@/lib/utils/error";

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeEntries = useCallback(async () => {
    try {
      const entries = await getTimeEntries();
      setTimeEntries(entries);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTimeEntry = useCallback(
    async (
      entry: Omit<TimeEntry, "id" | "created_at" | "user_id">,
      tags?: string[],
    ) => {
      try {
        const newEntry = await createTimeEntry(entry, tags);
        setTimeEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      } catch (error) {
        handleApiError(error);
      }
    },
    [],
  );

  const removeTimeEntry = useCallback(async (id: string) => {
    try {
      await deleteTimeEntry(id);
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  return {
    timeEntries,
    loading,
    fetchTimeEntries,
    addTimeEntry,
    removeTimeEntry,
  };
}
