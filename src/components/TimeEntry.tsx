import { memo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate, formatStartTime } from "@/lib/utils/time";

interface TimeEntryProps {
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

import { useTouchFeedback } from "@/hooks/useTouchFeedback";
import { useGestureControls } from "@/hooks/useGestureControls";

function TimeEntryComponent({
  taskName,
  projectName,
  duration,
  startTime,
  projectColor,
  onEdit,
  onDelete,
}: TimeEntryProps) {
  if (!taskName) {
    console.warn("TimeEntry: Missing required taskName prop");
    return null;
  }

  const formattedDate = formatDate(startTime);
  const formattedTime = formatStartTime(startTime);

  const { triggerHaptic, triggerHapticSuccess } = useTouchFeedback();
  const gestureRef = useGestureControls({
    onPan: (deltaX) => {
      if (Math.abs(deltaX) > 100) {
        triggerHaptic();
      }
    },
  });

  return (
    <Card
      ref={gestureRef}
      className="group p-3 bg-gradient-to-br from-card/95 to-card/90 hover:from-accent/20 hover:to-accent/10 transition-all duration-300 border border-border/50 rounded-xl shadow-sm hover:shadow-md touch-manipulation select-none active:scale-[0.98] animate-in fade-in-50 duration-500"
    >
      <div className="flex flex-col gap-2">
        {/* Task and Project Info */}
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

        {/* Time Info */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <time dateTime={startTime}>{formattedDate}</time>
            <span className="text-border/50">•</span>
            <span className="font-mono">{formattedTime}</span>
          </div>
          <span className="text-border/50">•</span>
          <div className="font-mono font-medium text-foreground bg-accent/20 px-2 py-0.5 rounded-md">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-10 px-3 rounded-lg hover:bg-accent/50 transition-colors duration-200 touch-manipulation select-none active:scale-[0.98]"
          >
            <Pencil className="h-4 w-4" />
            <span className="ml-2">Düzenle</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-10 px-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 touch-manipulation select-none active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-2">Sil</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default memo(TimeEntryComponent);
