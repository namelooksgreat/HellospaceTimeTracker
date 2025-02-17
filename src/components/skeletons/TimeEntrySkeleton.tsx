import { Skeleton } from "../ui/skeleton";

export function TimeEntrySkeleton() {
  return (
    <div className="p-3 bg-gradient-to-br from-card/95 to-card/90 border border-border/50 rounded-xl shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Skeleton className="w-3 h-3 mt-1 rounded-full flex-shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Skeleton className="h-4 w-20" />
          <div className="text-border/50">•</div>
          <Skeleton className="h-4 w-16" />
          <div className="text-border/50">•</div>
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
