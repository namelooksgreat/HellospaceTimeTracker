import { useRef, useEffect } from "react";

/**
 * Hook that tracks how many times a component has rendered
 * Useful for debugging and performance optimization
 */
export function useRenderCount(componentName?: string): number {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === "development" && componentName) {
      console.log(`[${componentName}] render #${renderCount.current}`);
    }
  });

  return renderCount.current;
}
