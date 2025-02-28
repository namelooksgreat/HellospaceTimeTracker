/**
 * Utilities for optimizing memory usage
 */

// WeakMap to store disposable resources
const disposables = new WeakMap<object, Array<() => void>>();

/**
 * Registers a cleanup function for a component or object
 * @param owner The component or object that owns the resource
 * @param cleanup Function to call when the owner is garbage collected
 */
export function registerDisposable(owner: object, cleanup: () => void): void {
  if (!disposables.has(owner)) {
    disposables.set(owner, []);
  }

  disposables.get(owner)!.push(cleanup);
}

/**
 * Disposes all resources associated with an owner
 * @param owner The component or object whose resources should be cleaned up
 */
export function disposeResources(owner: object): void {
  const cleanups = disposables.get(owner);
  if (!cleanups) return;

  cleanups.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      console.error("Error disposing resource:", error);
    }
  });

  disposables.delete(owner);
}

/**
 * Creates a pool of reusable objects to reduce garbage collection
 * @param factory Function that creates a new object
 * @param reset Function that resets an object for reuse
 * @param initialSize Initial size of the pool
 */
export function createObjectPool<T>(
  factory: () => T,
  reset: (obj: T) => void,
  initialSize: number = 10,
): {
  acquire: () => T;
  release: (obj: T) => void;
  size: () => number;
} {
  const pool: T[] = [];

  // Initialize the pool
  for (let i = 0; i < initialSize; i++) {
    pool.push(factory());
  }

  return {
    acquire: () => {
      if (pool.length > 0) {
        return pool.pop()!;
      }
      return factory();
    },
    release: (obj: T) => {
      reset(obj);
      pool.push(obj);
    },
    size: () => pool.length,
  };
}

/**
 * Limits the size of a cache to prevent memory leaks
 * @param cache The cache to limit
 * @param maxSize Maximum number of entries to keep
 */
export function limitCacheSize<K, V>(
  cache: Map<K, V>,
  maxSize: number = 100,
): void {
  if (cache.size <= maxSize) return;

  // Remove oldest entries (assuming insertion order)
  const entriesToRemove = cache.size - maxSize;
  const keys = Array.from(cache.keys()).slice(0, entriesToRemove);

  keys.forEach((key) => cache.delete(key));
}
