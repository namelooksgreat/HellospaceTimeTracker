import { useState, useCallback, useMemo } from "react";
import TimeEntryListVirtualized from "../TimeEntryListVirtualized";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useRenderOptimization } from "@/hooks/useRenderOptimization";
import { TimeEntry as TimeEntryType } from "@/types";

interface TimeEntryDisplay {
  id: string;
  taskName: string;
  projectName: string;
  duration: number;
  startTime: string;
  createdAt: string;
  projectColor: string;
  tags?: Array<{ id: string; name: string; color: string }>;
}

interface DailyReportOptimizedProps {
  entries: TimeEntryDisplay[];
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (id: string) => void;
}

export function DailyReportOptimized({
  entries = [],
  onDeleteEntry,
  onEditEntry,
}: DailyReportOptimizedProps) {
  // Track render performance
  useRenderOptimization("DailyReportOptimized");

  const [entryToDelete, setEntryToDelete] = useState<TimeEntryDisplay | null>(
    null,
  );

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteClick = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        setEntryToDelete(entry);
      }
    },
    [entries],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!entryToDelete) return;
    await onDeleteEntry(entryToDelete.id);
    setEntryToDelete(null);
  }, [entryToDelete, onDeleteEntry]);

  const handleEditClick = useCallback(
    (id: string) => {
      onEditEntry?.(id);
    },
    [onEditEntry],
  );

  // Memoize empty state to prevent re-renders
  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p className="text-center mb-1">No time entries for today</p>
        <p className="text-sm text-muted-foreground/80">
          Start tracking your time to see entries here
        </p>
      </div>
    ),
    [],
  );

  // Convert entries to TimeEntryType format
  const timeEntries = useMemo(() => {
    return entries.map((entry) => ({
      id: entry.id,
      task_name: entry.taskName,
      project: {
        name: entry.projectName,
        color: entry.projectColor,
      },
      duration: entry.duration,
      start_time: entry.startTime,
      created_at: entry.createdAt,
      tags: entry.tags,
      user_id: "current-user", // Add required user_id field
    })) as TimeEntryType[];
  }, [entries]);

  return (
    <>
      {entries.length > 0 ? (
        <TimeEntryListVirtualized
          entries={timeEntries}
          onEditEntry={handleEditClick}
          onDeleteEntry={handleDeleteClick}
          className="px-1.5 sm:px-4 -mx-1.5 sm:-mx-4 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-20"
        />
      ) : (
        emptyState
      )}

      <AlertDialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
