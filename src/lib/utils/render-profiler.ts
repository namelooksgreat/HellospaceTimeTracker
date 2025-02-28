import React from "react";

interface ProfilerProps {
  id: string;
  children: React.ReactNode;
  onRender?: (
    id: string,
    phase: string,
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => void;
}

/**
 * Component that measures render performance of its children
 */
export function RenderProfiler({ id, children, onRender }: ProfilerProps) {
  const handleRender = (
    id: string,
    phase: string,
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => {
    if (onRender) {
      onRender(id, phase, actualDuration, baseDuration, startTime, commitTime);
    } else if (process.env.NODE_ENV === "development") {
      console.log(
        `[Profiler] ${id} (${phase}) took ${actualDuration.toFixed(2)}ms (base: ${baseDuration.toFixed(2)}ms)`,
      );
    }
  };

  return React.createElement(
    React.Profiler,
    { id, onRender: handleRender },
    children,
  );
}

/**
 * Higher-order component that wraps a component with a profiler
 * @param Component Component to profile
 * @param id Profiler ID
 */
export function withProfiler<P extends object>(
  Component: React.ComponentType<P>,
  id: string,
): React.FC<P> {
  return (props: P) => {
    return React.createElement(
      RenderProfiler,
      { id, children: React.createElement(Component, props) },
      null,
    );
  };
}

/**
 * Creates a custom profiler hook for measuring component performance
 * @param componentName Name of the component
 */
export function createProfilerHook(componentName: string) {
  return function useComponentProfiler() {
    const renderStartTime = React.useRef(performance.now());

    React.useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Profiler] ${componentName} rendered in ${renderTime.toFixed(2)}ms`,
        );
      }

      // Reset for next render
      renderStartTime.current = performance.now();
    });
  };
}
