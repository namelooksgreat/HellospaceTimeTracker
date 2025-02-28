/**
 * Utility functions for memoization and render optimization
 */

// Cache for expensive calculations
const memoizationCache = new Map<string, any>();

/**
 * Memoizes the result of a function call based on its arguments
 * @param fn Function to memoize
 * @param keyFn Optional function to generate a cache key
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string,
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (memoizationCache.has(key)) {
      return memoizationCache.get(key);
    }

    const result = fn(...args);
    memoizationCache.set(key, result);
    return result;
  }) as T;
}

/**
 * Clears the memoization cache
 */
export function clearMemoizationCache(): void {
  memoizationCache.clear();
}

/**
 * Creates a stable object reference for props to prevent unnecessary re-renders
 * @param obj The object to stabilize
 */
export function stableObject<T extends Record<string, any>>(obj: T): T {
  const key = JSON.stringify(obj);
  if (memoizationCache.has(key)) {
    return memoizationCache.get(key);
  }

  memoizationCache.set(key, obj);
  return obj;
}
