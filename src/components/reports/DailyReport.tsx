import { ScrollArea } from "../ui/scroll-area";
import TimeEntry from "../TimeEntry";
import { Clock } from "lucide-react";

interface TimeEntryDisplay {
  id: string;
  taskName: string;
  projectName: string;
  duration: number;
  startTime: string;
  createdAt: string;
  projectColor: string;
}

interface DailyReportProps {
  entries: TimeEntryDisplay[];
  onDeleteEntry?: (id: string) => void;
  onEditEntry?: (id: string) => void;
}

export function DailyReport({
  entries = [],
  onDeleteEntry,
  onEditEntry,
}: DailyReportProps) {
  return (
    <ScrollArea className="h-[calc(100vh-24rem)] pr-4 -mr-4">
      <div className="space-y-3 pb-20">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <TimeEntry
              key={entry.id}
              taskName={entry.taskName}
              projectName={entry.projectName}
              duration={entry.duration}
              startTime={entry.startTime}
              projectColor={entry.projectColor}
              onDelete={() => onDeleteEntry?.(entry.id)}
              onEdit={() => onEditEntry?.(entry.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-center mb-1">No time entries for today</p>
            <p className="text-sm text-muted-foreground/80">
              Start tracking your time to see entries here
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
