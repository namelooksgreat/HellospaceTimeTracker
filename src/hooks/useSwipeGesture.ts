import { useEffect, useRef, useState } from "react";

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipeGesture(config: SwipeConfig = {}) {
  const { threshold = 50, onSwipeLeft, onSwipeRight } = config;
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = e.targetTouches[0].clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEnd.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);
      const swipeDistance = touchStart.current - touchEnd.current;

      if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return { isSwiping };
}
