import { useState, useCallback } from "react";
import { TimeEntry } from "@/types";
import { deleteTimeEntry, getTimeEntries } from "@/lib/api";
import { createTimeEntry } from "@/lib/api/timeEntries";
import { handleError } from "@/lib/utils/error";

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeEntries = useCallback(async () => {
    try {
      const entries = await getTimeEntries();
      setTimeEntries(entries);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTimeEntry = useCallback(
    async (entry: Omit<TimeEntry, "id" | "created_at" | "user_id">) => {
      try {
        const newEntry = await createTimeEntry(entry);
        setTimeEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      } catch (error) {
        handleError(error);
      }
    },
    [],
  );

  const removeTimeEntry = useCallback(async (id: string) => {
    try {
      await deleteTimeEntry(id);
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      handleError(error);
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
