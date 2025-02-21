import { memo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate, formatStartTime } from "@/lib/utils/time";

interface TimeEntryProps {
  id?: string;
  taskName: string;
  projectName?: string;
  duration: number;
  startTime: string;
  projectColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatDuration = (seconds: number): string => {
  const duration = typeof seconds === "number" ? Math.max(0, seconds) : 0;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

function TimeEntryComponent({
  taskName,
  projectName,
  duration,
  startTime,
  projectColor,
  onEdit,
  onDelete,
}: TimeEntryProps) {
  if (!taskName) return null;

  const formattedDate = formatDate(startTime);
  const formattedTime = formatStartTime(startTime);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-black/80 dark:via-black/60 dark:to-black/40 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="relative z-10 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <div
                className="w-3 h-3 mt-1 rounded-full ring-1 ring-border/50 shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: projectColor }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground truncate leading-tight max-w-[200px] sm:max-w-[400px]">
                  {taskName}
                </h3>
                {projectName && (
                  <div className="text-sm text-muted-foreground truncate mt-0.5">
                    {projectName}
                  </div>
                )}
              </div>
            </div>

            <div className="font-mono font-medium text-foreground bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 px-2.5 py-1 rounded-lg shadow-sm ring-1 ring-primary/5">
              {formatDuration(duration)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <time dateTime={startTime} className="tabular-nums">
                {formattedDate}
              </time>
              <span className="text-border/50">•</span>
              <span className="font-mono tabular-nums">{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 rounded-lg bg-background/50 hover:bg-accent/50 transition-all duration-150 sm:px-3 px-2"
              >
                <Pencil className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 rounded-lg text-destructive bg-background/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-150 sm:px-3 px-2"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TimeEntryComponent);
