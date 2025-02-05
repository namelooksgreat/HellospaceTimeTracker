import React, { memo } from "react";
import TimeEntry from "./TimeEntry";
import { ScrollArea } from "./ui/scroll-area";
import { Clock } from "lucide-react";

interface TimeEntryListProps {
  entries: Array<{
    id: string;
    taskName: string;
    projectName: string;
    duration: number;
    startTime: string;
    projectColor: string;
  }>;
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

const TimeEntryList = memo(
  ({ entries, onEditEntry, onDeleteEntry }: TimeEntryListProps) => {
    if (entries.length === 0) {
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

    return (
      <ScrollArea className="h-[400px] overflow-y-auto overscroll-none">
        <div className="space-y-2">
          {entries.map((entry) => (
            <TimeEntry
              key={entry.id}
              taskName={entry.taskName}
              projectName={entry.projectName}
              duration={entry.duration}
              startTime={entry.startTime}
              projectColor={entry.projectColor}
              onEdit={() => onEditEntry?.(entry.id)}
              onDelete={() => onDeleteEntry?.(entry.id)}
            />
          ))}
        </div>
      </ScrollArea>
    );
  },
);

TimeEntryList.displayName = "TimeEntryList";

export default TimeEntryList;
