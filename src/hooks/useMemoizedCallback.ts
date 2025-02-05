import { useCallback, useRef, useEffect } from "react";

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
): T {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, deps) as T;
}
