import { useEffect, useRef } from "react";

/**
 * Hook that shows which props changed between renders
 * Useful for debugging unnecessary re-renders
 */
export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, any>,
): void {
  // Only run in development
  if (process.env.NODE_ENV !== "development") return;

  const previousProps = useRef<Record<string, any>>({});

  useEffect(() => {
    if (previousProps.current) {
      // Get all keys from current and previous props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        // If previous value is different from current
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      // If any changes, log them
      if (Object.keys(changesObj).length) {
        console.log(`[${componentName}] Props changed:`, changesObj);
      }
    }

    // Update previousProps with current props for next render
    previousProps.current = props;
  });
}
