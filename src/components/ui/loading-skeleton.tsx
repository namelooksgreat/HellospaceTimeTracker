import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted/50", className)}
      {...props}
    />
  );
}

export function LoadingCard() {
  return (
    <div className="space-y-4 p-4">
      <LoadingSkeleton className="h-8 w-[200px]" />
      <LoadingSkeleton className="h-32" />
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-[250px]" />
        <LoadingSkeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
