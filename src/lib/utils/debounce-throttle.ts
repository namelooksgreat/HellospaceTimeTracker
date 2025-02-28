/**
 * Utilities for controlling the frequency of function calls
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to invoke the function immediately
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false,
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = window.setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every specified wait milliseconds
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @param options Additional options
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {},
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    if (!previous && !leading) previous = now;

    const remaining = wait - (now - previous);
    const context = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      func.apply(context, args);
    } else if (!timeout && trailing) {
      timeout = window.setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}

/**
 * Creates a function that will only execute once
 * @param func The function to restrict
 */
export function once<T extends (...args: any[]) => any>(func: T): T {
  let called = false;
  let result: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  } as T;
}
