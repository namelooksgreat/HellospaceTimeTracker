import React, { memo, useMemo } from "react";
import TimeEntry from "./TimeEntry";
import { ScrollArea } from "./ui/scroll-area";
import { Clock } from "lucide-react";
import { TimeEntry as TimeEntryType } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from "date-fns";
import { tr } from "date-fns/locale";

interface TimeEntryListProps {
  entries: TimeEntryType[];
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

type TimeRange = "all" | "daily" | "weekly" | "monthly" | "yearly";

function TimeEntryList({
  entries = [],
  onEditEntry,
  onDeleteEntry,
}: TimeEntryListProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("all");

  const filteredEntries = useMemo(() => {
    if (timeRange === "all") return entries;

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case "daily":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "weekly":
        startDate = startOfWeek(now, { locale: tr });
        endDate = endOfWeek(now, { locale: tr });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "yearly":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        return entries;
    }

    return entries.filter((entry) => {
      const entryDate = new Date(entry.start_time);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
  }, [entries, timeRange]);

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
    <div className="space-y-4">
      <div>
        <Select
          value={timeRange}
          onValueChange={(value: TimeRange) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zaman aralığı seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="daily">Bugün</SelectItem>
            <SelectItem value="weekly">Bu Hafta</SelectItem>
            <SelectItem value="monthly">Bu Ay</SelectItem>
            <SelectItem value="yearly">Bu Yıl</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="h-[400px] overflow-y-auto overscroll-none">
        <div className="space-y-2">
          {filteredEntries
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
    </div>
  );
}

TimeEntryList.displayName = "TimeEntryList";

export default memo(TimeEntryList);
