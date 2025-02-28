import { useRef, useEffect, useCallback } from "react";

/**
 * Creates a stable callback reference that doesn't change between renders
 * This is a more efficient alternative to useCallback for functions that
 * don't depend on props or state
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = useRef<T>(callback);

  // Update the ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Return a stable function that calls the current callback
  return useCallback(
    ((...args: any[]) => callbackRef.current(...args)) as T,
    [],
  );
}

/**
 * Prevents unnecessary re-renders by skipping updates when props haven't changed
 * @param prevProps Previous props
 * @param nextProps Next props
 * @param keys Specific keys to compare (compares all keys if not provided)
 */
export function shouldComponentUpdate<P extends object>(
  prevProps: P,
  nextProps: P,
  keys?: (keyof P)[],
): boolean {
  if (keys) {
    return keys.some((key) => prevProps[key] !== nextProps[key]);
  }

  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) return true;

  return prevKeys.some(
    (key) => prevProps[key as keyof P] !== nextProps[key as keyof P],
  );
}

/**
 * Creates a stable object reference that doesn't change unless its values change
 * @param obj The object to stabilize
 */
export function useStableObject<T extends object>(obj: T): T {
  const ref = useRef<T>(obj);

  // Only update the ref if the object has changed
  if (JSON.stringify(ref.current) !== JSON.stringify(obj)) {
    ref.current = obj;
  }

  return ref.current;
}

/**
 * Prevents layout thrashing by batching DOM reads and writes
 */
export const DOMOperations = {
  readQueue: [] as Array<() => void>,
  writeQueue: [] as Array<() => void>,

  read(fn: () => void): void {
    this.readQueue.push(fn);
    this.schedule();
  },

  write(fn: () => void): void {
    this.writeQueue.push(fn);
    this.schedule();
  },

  scheduledAnimationFrame: 0,

  schedule(): void {
    if (this.scheduledAnimationFrame) return;

    this.scheduledAnimationFrame = requestAnimationFrame(() => {
      // Process all reads first
      const reads = this.readQueue;
      this.readQueue = [];
      reads.forEach((read) => read());

      // Then process all writes
      const writes = this.writeQueue;
      this.writeQueue = [];
      writes.forEach((write) => write());

      this.scheduledAnimationFrame = 0;
    });
  },
};
