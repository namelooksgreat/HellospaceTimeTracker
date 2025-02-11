import { memo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { formatDate, formatStartTime } from "@/lib/utils/time";

interface TimeEntryProps {
  taskName: string;
  projectName?: string;
  duration: number;
  startTime: string;
  createdAt: string;
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
  createdAt,
  projectColor,
  onEdit,
  onDelete,
}: TimeEntryProps) {
  if (!taskName) {
    console.warn("TimeEntry: Missing required taskName prop");
    return null;
  }

  const formattedDate = formatDate(createdAt);
  const formattedTime = formatStartTime(startTime);

  return (
    <Card className="group p-3 sm:p-4 bg-gradient-to-br from-card/95 to-card/90 hover:from-accent/20 hover:to-accent/10 transition-all duration-300 border border-border/50 rounded-xl shadow-sm hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        {/* Left Section: Project Color, Task Name, and Details */}
        <div className="flex items-start flex-1 min-w-0 gap-2 sm:gap-3">
          <div
            className="w-3 h-3 mt-1.5 sm:mt-1 rounded-full ring-1 ring-border/50 shadow-sm flex-shrink-0"
            style={{ backgroundColor: projectColor }}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-medium text-foreground truncate leading-tight">
              {taskName}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {projectName && (
                <span className="truncate font-medium max-w-[120px] sm:max-w-none">
                  {projectName}
                </span>
              )}
              <span className="hidden sm:inline text-border/50">•</span>
              {formattedDate && (
                <time
                  dateTime={createdAt}
                  className="text-xs text-muted-foreground/80"
                >
                  {formattedDate}
                </time>
              )}
              <span className="hidden sm:inline text-border/50">•</span>
              {formattedTime && (
                <span className="font-mono text-xs sm:text-sm">
                  {formattedTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Duration and Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
          <div className="text-sm sm:text-base font-mono font-semibold text-foreground bg-accent/20 px-2 sm:px-3 py-1 rounded-md transition-colors duration-200 group-hover:bg-accent/30">
            {formatDuration(duration)}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-accent/50 transition-colors duration-200"
                  >
                    <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sr-only">Edit entry</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10}>
                  <p>Edit entry</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sr-only">Delete entry</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10}>
                  <p>Delete entry</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TimeEntryComponent);
