import { useCallback, useRef } from "react";

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
): T {
  const ref = useRef<T>(callback);

  useCallback(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, deps) as T;
}
