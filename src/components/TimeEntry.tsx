import { memo, useMemo } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Pencil,
  Trash2,
  Tag as TagIcon,
  Clock,
  Pause,
  Play,
  CheckCircle,
} from "lucide-react";
import { formatDate, formatStartTime } from "@/lib/utils/time";
import {
  entryStatusStyles,
  statusIndicators,
} from "@/styles/status-indicators";

interface TimeEntryProps {
  id?: string;
  taskName: string;
  projectName?: string;
  duration: number;
  startTime: string;
  projectColor?: string;
  tags?: Array<{ id: string; name: string; color: string }>;
  status?: "active" | "paused" | "completed" | "overdue";
  onEdit?: () => void;
  onDelete?: () => void;
}

import { formatDuration } from "@/lib/utils/common";

function TimeEntryComponent({
  taskName,
  projectName,
  duration,
  startTime,
  projectColor,
  tags = [],
  status = "completed",
  onEdit,
  onDelete,
}: TimeEntryProps) {
  if (!taskName) return null;

  // Memoize formatted date and time
  const formattedDate = useMemo(() => formatDate(startTime), [startTime]);
  const formattedTime = useMemo(() => formatStartTime(startTime), [startTime]);

  // Memoize status icon
  const StatusIcon = useMemo(
    () =>
      ({
        active: Play,
        paused: Pause,
        completed: CheckCircle,
        overdue: Clock,
      })[status],
    [status],
  );

  return (
    <Card
      className={useMemo(
        () =>
          cn(
            "card-default",
            "group",
            entryStatusStyles[status].card,
            entryStatusStyles[status].shadow,
          ),
        [status],
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.15] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.1]" />
      <div className="relative z-10 p-standard-sm">
        <div className="flex flex-col gap-standard-sm">
          <div className="flex items-start justify-between gap-standard-sm">
            <div className="flex items-start gap-standard-sm min-w-0">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-3 h-3 mt-1 rounded-full ring-1 ring-border/50 shadow-sm flex-shrink-0 transition-transform transition-medium ease-default group-hover:scale-110"
                  style={{ backgroundColor: projectColor }}
                />
                <div
                  className={useMemo(
                    () =>
                      cn(
                        statusIndicators.dot.base,
                        statusIndicators.dot[status],
                        status === "active" && "animate-pulse",
                      ),
                    [status],
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="heading-5 leading-tight">{taskName}</h3>
                  {status !== "completed" && (
                    <div
                      className={useMemo(
                        () =>
                          cn(
                            statusIndicators.pill.base,
                            statusIndicators.pill[status],
                          ),
                        [status],
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>
                        {status === "active"
                          ? "Çalışıyor"
                          : status === "paused"
                            ? "Duraklatıldı"
                            : "Gecikmiş"}
                      </span>
                    </div>
                  )}
                </div>
                {projectName && (
                  <div className="body-small text-muted-foreground truncate mt-0.5">
                    {projectName}
                  </div>
                )}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="badge-sm badge-tag"
                        style={{ borderColor: tag.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={useMemo(
                () =>
                  cn(
                    "font-mono font-medium px-2.5 py-1 rounded-lg shadow-sm ring-1",
                    status === "active"
                      ? "bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-green-500/30 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20"
                      : status === "paused"
                        ? "bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-orange-500/30 text-amber-700 dark:text-amber-400 ring-amber-500/20"
                        : status === "completed"
                          ? "bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 text-blue-700 dark:text-blue-400 ring-blue-500/20"
                          : "bg-gradient-to-r from-red-500/30 via-pink-500/30 to-rose-500/30 text-red-700 dark:text-red-400 ring-red-500/20",
                  ),
                [status],
              )}
            >
              {formatDuration(duration)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-standard-sm">
            <div className="flex items-center gap-1.5 body-small text-tertiary">
              <time dateTime={startTime} className="tabular-nums">
                {formattedDate}
              </time>
              <span className="text-border/50">•</span>
              <span className="font-mono tabular-nums">{formattedTime}</span>
            </div>
            <div className="flex items-center gap-standard-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="btn-sm btn-ghost bg-background/50 hover:bg-muted/50 sm:px-3 px-2"
              >
                <Pencil className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Düzenle</span>
                <span className="sm:hidden sr-only">Düzenle</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="btn-sm text-destructive bg-background/50 hover:bg-destructive/10 hover:text-destructive sm:px-3 px-2"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sil</span>
                <span className="sm:hidden sr-only">Sil</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TimeEntryComponent, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.taskName === nextProps.taskName &&
    prevProps.projectName === nextProps.projectName &&
    prevProps.duration === nextProps.duration &&
    prevProps.startTime === nextProps.startTime &&
    prevProps.projectColor === nextProps.projectColor &&
    prevProps.status === nextProps.status &&
    // Deep comparison for tags array
    JSON.stringify(prevProps.tags) === JSON.stringify(nextProps.tags) &&
    // Function references should be stable (ideally memoized by parent)
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});
