import { useEffect, useRef, useState } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const touchStart = useRef<number>(0);
  const pullThreshold = 80;

  useEffect(() => {
    let isRefreshing = false;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = document.documentElement.scrollTop;
      if (scrollTop <= 0) {
        touchStart.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStart.current;
      const progress = Math.min(Math.max(pullDistance / pullThreshold, 0), 1);
      setPullProgress(progress);

      if (pullDistance > 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      setIsPulling(false);
      if (pullProgress >= 1 && !isRefreshing) {
        isRefreshing = true;
        await onRefresh();
        isRefreshing = false;
      }
      setPullProgress(0);
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullProgress, onRefresh]);

  return { isPulling, pullProgress };
}
