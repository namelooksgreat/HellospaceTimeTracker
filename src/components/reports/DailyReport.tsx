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
    <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-20rem)] px-1.5 sm:px-4 -mx-1.5 sm:-mx-4">
      <div className="space-y-2 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-20">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div key={entry.id} className="animate-in fade-in-50 duration-300">
              <TimeEntry
                taskName={entry.taskName}
                projectName={entry.projectName}
                duration={entry.duration}
                startTime={entry.startTime}
                projectColor={entry.projectColor}
                onDelete={() => onDeleteEntry?.(entry.id)}
                onEdit={() => onEditEntry?.(entry.id)}
              />
            </div>
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
