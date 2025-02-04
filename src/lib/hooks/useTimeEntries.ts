import { useState, useCallback } from "react";
import { TimeEntry } from "@/types";
import { createTimeEntry, deleteTimeEntry, getTimeEntries } from "@/lib/api";
import { handleApiError } from "@/lib/utils/error";

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = await getTimeEntries();
      setTimeEntries(entries);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch time entries");
      setError(error);
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
        setError(null);
        const newEntry = await createTimeEntry(entry, tags);
        setTimeEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to add time entry");
        setError(error);
        handleApiError(error);
      }
    },
    [],
  );

  const removeTimeEntry = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteTimeEntry(id);
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete time entry");
      setError(error);
      handleApiError(error);
    }
  }, []);

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries,
    addTimeEntry,
    removeTimeEntry,
  };
}
