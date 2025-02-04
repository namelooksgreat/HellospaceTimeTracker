export const measurePerformance = (name: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const duration = end - start;
    console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  };
};

export const withPerformanceTracking = <T extends (...args: any[]) => any>(
  fn: T,
  name: string,
): T => {
  return ((...args: Parameters<T>) => {
    const end = measurePerformance(name);
    const result = fn(...args);
    if (result instanceof Promise) {
      return result.finally(end);
    }
    end();
    return result;
  }) as T;
};
