import { useState, useCallback } from "react";
import { ScrollArea } from "../ui/scroll-area";
import TimeEntry from "../TimeEntry";
import { Clock } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { cn } from "@/lib/utils";

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
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
}

export function DailyReport({
  entries = [],
  onDeleteEntry,
  onEditEntry,
  onRefresh = async () => {},
  onLoadMore = async () => {},
}: DailyReportProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { isPulling, pullProgress } = usePullToRefresh(async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error("Error refreshing:", error);
    }
  });

  const { isFetching, observe } = useInfiniteScroll(async () => {
    if (isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      await onLoadMore();
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  });

  const renderSkeletons = useCallback(() => {
    return Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="animate-in fade-in-50 duration-500 space-y-2">
        <Skeleton className="h-[72px] w-full rounded-xl" />
      </div>
    ));
  }, []);

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-background/80 backdrop-blur-sm transition-transform z-50",
            "border-b border-border/50",
          )}
          style={{ transform: `translateY(${pullProgress * 100}%)` }}
        >
          <div
            className={cn(
              "rounded-full h-6 w-6 border-2 border-primary border-t-transparent",
              pullProgress >= 1 ? "animate-spin" : "transition-transform",
            )}
            style={{
              transform:
                pullProgress < 1
                  ? `rotate(${pullProgress * 360}deg)`
                  : undefined,
            }}
          />
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-20rem)] px-1.5 sm:px-4 -mx-1.5 sm:-mx-4 touch-pan-y overscroll-none">
        <div className="space-y-2.5 sm:space-y-3 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-20">
          {entries.length > 0 ? (
            <>
              {entries.map((entry) => (
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
              ))}
              {isLoadingMore && renderSkeletons()}
              <div ref={observe} className="h-4" />
            </>
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
    </div>
  );
}
