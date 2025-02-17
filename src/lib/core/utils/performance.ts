export class Performance {
  private static measurements = new Map<string, number>();

  static start(label: string): void {
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number {
    const start = this.measurements.get(label);
    if (!start) {
      console.warn(`No start time found for measurement: ${label}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.measurements.delete(label);

    // Log if duration is above threshold
    if (duration > 100) {
      // 100ms threshold
      console.warn(
        `Slow operation detected: ${label} took ${duration.toFixed(2)}ms`,
      );
    }

    return duration;
  }

  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  }

  static wrap<T extends Function>(label: string, fn: T): T {
    return ((...args: any[]) => {
      this.start(label);
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.finally(() => this.end(label));
        }
        this.end(label);
        return result;
      } catch (error) {
        this.end(label);
        throw error;
      }
    }) as any;
  }
}
