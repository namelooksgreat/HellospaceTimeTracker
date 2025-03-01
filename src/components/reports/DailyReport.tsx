import { ScrollArea } from "../ui/scroll-area";
import TimeEntry from "../TimeEntry";
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
import { useState, useMemo } from "react";

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

interface DailyReportProps {
  entries: TimeEntryDisplay[];
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (id: string) => void;
}

export function DailyReport({
  entries = [],
  onDeleteEntry,
  onEditEntry,
}: DailyReportProps) {
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryDisplay | null>(
    null,
  );

  // Sort entries by date and time (newest first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
  }, [entries]);

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    await onDeleteEntry(entryToDelete.id);
    setEntryToDelete(null);
  };

  return (
    <>
      <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-20rem)] px-1.5 sm:px-4 -mx-1.5 sm:-mx-4">
        <div className="space-y-2 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-20">
          {sortedEntries.length > 0 ? (
            sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="animate-in fade-in-50 duration-300"
              >
                <TimeEntry
                  id={entry.id}
                  taskName={entry.taskName}
                  projectName={entry.projectName}
                  duration={entry.duration}
                  startTime={entry.startTime}
                  projectColor={entry.projectColor}
                  tags={entry.tags}
                  onDelete={() => setEntryToDelete(entry)}
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
