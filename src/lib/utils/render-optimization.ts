/**
 * Utilities for optimizing React rendering performance
 */

// Track component render times
const renderTimes = new Map<string, number[]>();

/**
 * Tracks the render time of a component
 * @param componentName Name of the component
 * @param startTime Start time of the render
 */
export function trackRenderTime(
  componentName: string,
  startTime: number,
): void {
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (!renderTimes.has(componentName)) {
    renderTimes.set(componentName, []);
  }

  const times = renderTimes.get(componentName)!;
  times.push(renderTime);

  // Keep only the last 10 render times
  if (times.length > 10) {
    times.shift();
  }

  if (process.env.NODE_ENV === "development" && renderTime > 16) {
    // 16ms = 60fps threshold
    console.warn(
      `%c[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms`,
      "color: #ef4444; font-weight: bold;",
    );
  }
}

/**
 * Gets the average render time for a component
 * @param componentName Name of the component
 */
export function getAverageRenderTime(componentName: string): number {
  const times = renderTimes.get(componentName);
  if (!times || times.length === 0) return 0;

  const sum = times.reduce((acc, time) => acc + time, 0);
  return sum / times.length;
}

/**
 * Resets all tracked render times
 */
export function resetRenderTimes(): void {
  renderTimes.clear();
}

/**
 * Higher-order function to create a stable callback that doesn't change on every render
 * @param callback The callback function to stabilize
 */
export function stableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  // This is a simplified version - in a real app, you'd use useCallback
  return callback;
}
