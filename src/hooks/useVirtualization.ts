import { useState, useEffect, useRef, useMemo } from "react";

interface VirtualizationOptions {
  itemHeight: number;
  overscan?: number;
  scrollingDelay?: number;
}

interface VirtualizationResult<T> {
  virtualItems: Array<{ index: number; item: T; offsetTop: number }>;
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  isScrolling: boolean;
}

/**
 * Hook for virtualizing long lists to improve rendering performance
 * @param items Array of items to virtualize
 * @param options Configuration options
 */
export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions,
): VirtualizationResult<T> {
  const { itemHeight, overscan = 3, scrollingDelay = 150 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<number | null>(null);

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setContainerHeight(height);
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      setIsScrolling(true);

      if (scrollingTimeoutRef.current !== null) {
        window.clearTimeout(scrollingTimeoutRef.current);
      }

      scrollingTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollingTimeoutRef.current = null;
      }, scrollingDelay);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollingTimeoutRef.current !== null) {
        window.clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, [scrollingDelay]);

  // Calculate visible items
  const virtualItems = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
    );

    const visibleItems = [];

    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight,
      });
    }

    return { items: visibleItems, totalHeight };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  return {
    virtualItems: virtualItems.items,
    totalHeight: virtualItems.totalHeight,
    containerRef,
    isScrolling,
  };
}
