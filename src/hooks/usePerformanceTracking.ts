import { useEffect } from "react";
import { measurePerformance } from "@/utils/performance";

export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const end = measurePerformance(`${componentName}_render`);
    return () => {
      end();
    };
  }, [componentName]);
}
