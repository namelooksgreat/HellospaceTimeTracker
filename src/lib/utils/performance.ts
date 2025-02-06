export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) => {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
) => {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const measurePerformance = (name: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const duration = end - start;
    console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  };
};
