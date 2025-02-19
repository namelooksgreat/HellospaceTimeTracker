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
    <Card className="bg-card/95 dark:bg-card/90 border-border/50 shadow-sm">
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div
              className="w-3 h-3 mt-1 rounded-full ring-1 ring-border/50 shadow-sm flex-shrink-0"
              style={{ backgroundColor: projectColor }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground truncate leading-tight">
                {taskName}
              </h3>
              {projectName && (
                <div className="text-sm text-muted-foreground truncate mt-0.5">
                  {projectName}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <time dateTime={startTime}>{formattedDate}</time>
              <span className="text-border/50">•</span>
              <span className="font-mono">{formattedTime}</span>
            </div>
            <span className="text-border/50">•</span>
            <div className="font-mono font-medium text-foreground bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 px-2 py-0.5 rounded-md">
              {formatDuration(duration)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-9 px-2.5 rounded-lg hover:bg-accent/50"
            >
              <Pencil className="h-4 w-4" />
              <span className="ml-1.5 text-sm">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-9 px-2.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1.5 text-sm">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TimeEntryComponent);
