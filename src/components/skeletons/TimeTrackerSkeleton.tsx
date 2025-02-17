import { Skeleton } from "../ui/skeleton";

export function TimeTrackerSkeleton() {
  return (
    <div className="p-3 space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
    </div>
  );
}
