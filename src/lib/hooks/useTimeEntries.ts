import { useState, useCallback } from "react";
import { TimeEntry } from "@/types";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/utils/logger";
import { useDebounce } from "./useDebounce";
import { useMemoizedCallback } from "./useMemoizedCallback";

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeEntries = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = await apiClient.get<TimeEntry[]>("time_entries");
      setTimeEntries(entries);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch time entries");
      setError(error);
      logger.error("Failed to fetch time entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTimeEntry = useMemoizedCallback(
    async (
      entry: Omit<TimeEntry, "id" | "created_at" | "user_id">,
      tags?: string[],
    ) => {
      try {
        setError(null);
        const newEntry = await apiClient.post<TimeEntry>("time_entries", entry);

        if (tags?.length) {
          await apiClient.post("time_entry_tags", {
            time_entry_id: newEntry.id,
            tags,
          });
        }

        setTimeEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to add time entry");
        setError(error);
        logger.error("Failed to add time entry:", error);
        throw error;
      }
    },
    [],
  );

  const removeTimeEntry = useMemoizedCallback(async (id: string) => {
    try {
      setError(null);
      await apiClient.delete("time_entries", id);
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete time entry");
      setError(error);
      logger.error("Failed to delete time entry:", error);
      throw error;
    }
  }, []);

  const updateTimeEntry = useMemoizedCallback(
    async (id: string, updates: Partial<TimeEntry>, tags?: string[]) => {
      try {
        setError(null);
        const updatedEntry = await apiClient.put<TimeEntry>(
          "time_entries",
          id,
          updates,
        );

        if (tags !== undefined) {
          await apiClient.delete("time_entry_tags", id);
          if (tags.length > 0) {
            await apiClient.post("time_entry_tags", {
              time_entry_id: id,
              tags,
            });
          }
        }

        setTimeEntries((prev) =>
          prev.map((entry) => (entry.id === id ? updatedEntry : entry)),
        );
        return updatedEntry;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update time entry");
        setError(error);
        logger.error("Failed to update time entry:", error);
        throw error;
      }
    },
    [],
  );

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries,
    addTimeEntry,
    removeTimeEntry,
    updateTimeEntry,
  };
}
