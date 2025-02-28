import React, { ComponentType, memo } from "react";

/**
 * Creates a memoized version of a component with custom comparison
 * @param Component The component to memoize
 * @param propsAreEqual Optional custom comparison function
 */
export function createMemoizedComponent<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * Default props comparison function that does deep comparison of objects
 */
export function deepPropsComparison<P extends object>(
  prevProps: Readonly<P>,
  nextProps: Readonly<P>,
): boolean {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

/**
 * Creates a props comparison function that only compares specific keys
 * @param keys The keys to compare
 */
export function createPropsComparison<P extends object>(
  keys: (keyof P)[],
): (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean {
  return (prevProps, nextProps) => {
    return keys.every((key) => prevProps[key] === nextProps[key]);
  };
}

/**
 * Wraps a component with performance tracking
 * @param Component The component to wrap
 * @param componentName Name of the component for tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string,
): ComponentType<P> {
  return (props: P) => {
    const startTime = performance.now();

    // Use React.useEffect for cleanup in actual implementation
    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `%c[${componentName}] rendered in ${renderTime.toFixed(2)}ms`,
          "color: #10b981;",
        );
      }
    });

    return React.createElement(Component, props);
  };
}
