import React, { memo } from "react";
import TimeEntry from "./TimeEntry";
import { ScrollArea } from "./ui/scroll-area";
import { Clock } from "lucide-react";
import { TimeEntry as TimeEntryType } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";

interface TimeEntryListProps {
  entries: TimeEntryType[];
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

const TimeEntryList = memo(
  ({ entries = [], onEditEntry, onDeleteEntry }: TimeEntryListProps) => {
    console.debug("TimeEntryList received entries:", entries);

    if (!Array.isArray(entries) || entries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p className="text-center mb-1">No time entries yet</p>
          <p className="text-sm text-muted-foreground/80">
            Start tracking your time to see entries here
          </p>
        </div>
      );
    }

    const handleDelete = async (entry: TimeEntryType) => {
      if (!entry.id || !onDeleteEntry) return;
      try {
        await onDeleteEntry(entry.id);
        toast.success("Time entry deleted", {
          description: `Deleted ${entry.task_name}`,
        });
      } catch (error) {
        handleError(error, "TimeEntryList");
        toast.error("Failed to delete time entry", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    return (
      <ScrollArea className="h-[400px] overflow-y-auto overscroll-none">
        <div className="space-y-2">
          {entries
            .map((entry) => {
              if (!entry?.id || !entry?.task_name) {
                console.warn("Invalid entry:", entry);
                return null;
              }

              const duration =
                typeof entry.duration === "string"
                  ? parseInt(entry.duration)
                  : entry.duration;
              if (isNaN(duration)) {
                console.warn("Invalid duration for entry:", entry);
                return null;
              }

              if (!entry.task_name) {
                console.warn("Entry missing task_name:", entry);
                return null;
              }

              return (
                <TimeEntry
                  key={entry.id}
                  taskName={entry.task_name}
                  projectName={entry.project?.name}
                  duration={duration}
                  startTime={entry.start_time || ""}
                  createdAt={entry.created_at || new Date().toISOString()}
                  projectColor={entry.project?.color}
                  onEdit={() => onEditEntry?.(entry.id)}
                  onDelete={() => handleDelete(entry)}
                />
              );
            })
            .filter(Boolean)}
        </div>
      </ScrollArea>
    );
  },
);

TimeEntryList.displayName = "TimeEntryList";

export default TimeEntryList;
