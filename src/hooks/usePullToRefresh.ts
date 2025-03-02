import { useRef, useEffect, useState } from "react";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  backgroundColor?: string;
  pullingContent?: React.ReactNode;
  refreshingContent?: React.ReactNode;
}

export function usePullToRefresh({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
}: PullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  const isActive = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate pull-to-refresh when at the top of the container
      if (container.scrollTop <= 0) {
        touchStartY.current = e.touches[0].clientY;
        isActive.current = true;
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isActive.current) return;

      touchMoveY.current = e.touches[0].clientY;
      const distance = touchMoveY.current - touchStartY.current;

      // Only allow pulling down
      if (distance > 0) {
        // Apply resistance to make the pull feel more natural
        const newDistance = Math.min(distance * 0.5, maxPullDownDistance);
        setPullDistance(newDistance);
        setIsPulling(true);

        // Prevent default scrolling behavior
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isActive.current) return;

      if (pullDistance >= pullDownThreshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(pullDownThreshold); // Keep indicator visible during refresh

        try {
          // Trigger haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(15);
          }

          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }
      } else {
        // Reset if not pulled enough
        setPullDistance(0);
        setIsPulling(false);
      }

      isActive.current = false;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    onRefresh,
    pullDownThreshold,
    maxPullDownDistance,
    pullDistance,
    isRefreshing,
  ]);

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
  };
}
