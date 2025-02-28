import { useEffect, useRef } from "react";

/**
 * Hook to optimize component rendering by skipping unnecessary renders
 * and measuring render performance
 */
export function useRenderOptimization(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - lastRenderTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `%c[${componentName}] render #${renderCount.current} took ${renderTime.toFixed(2)}ms`,
        "color: #3b82f6;",
      );
    }

    return () => {
      lastRenderTime.current = performance.now();
    };
  });

  return {
    renderCount: renderCount.current,
  };
}
