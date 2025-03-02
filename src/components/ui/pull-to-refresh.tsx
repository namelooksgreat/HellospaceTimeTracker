import * as React from "react";
import { cn } from "@/lib/utils";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps extends React.HTMLAttributes<HTMLDivElement> {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  refreshingContent?: React.ReactNode;
  pullingContent?: React.ReactNode;
  children: React.ReactNode;
}

export function PullToRefresh({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  refreshingContent,
  pullingContent,
  children,
  className,
  ...props
}: PullToRefreshProps) {
  const { containerRef, isPulling, isRefreshing, pullDistance } =
    usePullToRefresh({
      onRefresh,
      pullDownThreshold,
      maxPullDownDistance,
    });

  // Calculate progress percentage for the indicator
  const progress = Math.min(pullDistance / pullDownThreshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute left-0 right-0 flex justify-center items-center overflow-hidden transition-all duration-200 z-10"
          style={{
            height: `${pullDistance}px`,
            top: 0,
          }}
        >
          {isRefreshing
            ? refreshingContent || (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )
            : pullingContent || (
                <div className="flex items-center justify-center h-full">
                  <svg
                    className="h-6 w-6 text-primary transition-transform"
                    style={{
                      transform: `rotate(${Math.min(progress * 180, 180)}deg)`,
                      opacity: Math.max(0.3, progress),
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v14" />
                    <path d="m17 8-5-5-5 5" />
                  </svg>
                </div>
              )}
        </div>
      )}

      {/* Main content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform:
            isPulling || isRefreshing
              ? `translateY(${pullDistance}px)`
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
