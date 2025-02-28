/**
 * Performance monitoring utilities for React applications
 */

interface PerformanceMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];
const METRICS_LIMIT = 100;

/**
 * Records a performance metric for a component render
 */
export function recordRenderMetric(
  componentName: string,
  renderTime: number,
): void {
  metrics.push({
    componentName,
    renderTime,
    timestamp: Date.now(),
  });

  // Keep metrics array from growing too large
  if (metrics.length > METRICS_LIMIT) {
    metrics.shift();
  }

  // Log slow renders in development
  if (process.env.NODE_ENV === "development" && renderTime > 16) {
    console.warn(
      `%c[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
      "color: #f59e0b; font-weight: bold;",
    );
  }
}

/**
 * Gets performance metrics for all components
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Gets average render time for a specific component
 */
export function getComponentAverageRenderTime(componentName: string): number {
  const componentMetrics = metrics.filter(
    (m) => m.componentName === componentName,
  );
  if (componentMetrics.length === 0) return 0;

  const total = componentMetrics.reduce(
    (sum, metric) => sum + metric.renderTime,
    0,
  );
  return total / componentMetrics.length;
}

/**
 * Clears all recorded performance metrics
 */
export function clearPerformanceMetrics(): void {
  metrics.length = 0;
}

/**
 * Monitors a function execution time and logs if it exceeds a threshold
 */
export function monitorFunctionPerformance<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  thresholdMs: number = 10,
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const executionTime = performance.now() - start;

    if (executionTime > thresholdMs) {
      console.warn(
        `%c[Performance] Function ${functionName} took ${executionTime.toFixed(2)}ms to execute`,
        "color: #f59e0b;",
      );
    }

    return result;
  }) as T;
}
