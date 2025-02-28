/**
 * Utility functions for performance optimization
 */

/**
 * Measures the execution time of a function
 * @param fn Function to measure
 * @param args Arguments to pass to the function
 * @returns The result of the function and the execution time in milliseconds
 */
export function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): { result: ReturnType<T>; executionTime: number } {
  const start = performance.now();
  const result = fn(...args);
  const executionTime = performance.now() - start;

  return { result, executionTime };
}

/**
 * Creates a version of a function that logs its execution time
 * @param fn Function to wrap
 * @param name Name to use in the log
 * @returns Wrapped function that logs execution time
 */
export function withPerformanceLogging<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const { result, executionTime } = measureExecutionTime(fn, ...args);

    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name} took ${executionTime.toFixed(2)}ms`);
    }

    return result;
  };
}

/**
 * Checks if the browser is currently idle
 * @returns Promise that resolves when the browser is idle
 */
export function whenIdle(): Promise<void> {
  if (typeof window === "undefined" || !("requestIdleCallback" in window)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    (window as any).requestIdleCallback(() => resolve());
  });
}

/**
 * Runs a task during browser idle time
 * @param task Function to run
 * @param timeout Maximum time to wait before running the task anyway
 */
export function runWhenIdle(
  task: () => void,
  timeout: number = 2000,
): { cancel: () => void } {
  if (typeof window === "undefined" || !("requestIdleCallback" in window)) {
    const timeoutId = setTimeout(task, 0);
    return { cancel: () => clearTimeout(timeoutId) };
  }

  const handle = (window as any).requestIdleCallback(task, { timeout });

  return {
    cancel: () => (window as any).cancelIdleCallback(handle),
  };
}

/**
 * Splits a heavy task into smaller chunks to avoid blocking the main thread
 * @param items Items to process
 * @param processItem Function to process each item
 * @param chunkSize Number of items to process in each chunk
 * @returns Promise that resolves when all items are processed
 */
export function processInChunks<T, R>(
  items: T[],
  processItem: (item: T) => R,
  chunkSize: number = 5,
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = [];
    let index = 0;

    function processNextChunk() {
      const startTime = performance.now();

      while (index < items.length && performance.now() - startTime < 16) {
        // Process items until we've used up our time budget (16ms = 60fps)
        const chunk = items.slice(index, index + chunkSize);
        const chunkResults = chunk.map(processItem);
        results.push(...chunkResults);
        index += chunk.length;
      }

      if (index < items.length) {
        // Schedule the next chunk
        setTimeout(processNextChunk, 0);
      } else {
        // All done
        resolve(results);
      }
    }

    processNextChunk();
  });
}
