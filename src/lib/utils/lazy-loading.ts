import { lazy, ComponentType } from "react";

/**
 * Enhanced lazy loading utility with retry mechanism and loading tracking
 * @param factory Function that imports the component
 * @param fallback Optional fallback component to show while loading
 */
export function enhancedLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: { retries?: number; timeout?: number } = {},
): React.LazyExoticComponent<T> {
  const { retries = 3, timeout = 10000 } = options;

  return lazy(() => {
    let attempts = 0;

    const attempt = (): Promise<{ default: T }> => {
      attempts++;

      return new Promise((resolve, reject) => {
        // Set timeout to abort if loading takes too long
        const timeoutId = setTimeout(() => {
          if (attempts < retries) {
            console.warn(
              `Component loading timed out, retrying (${attempts}/${retries})...`,
            );
            clearTimeout(timeoutId);
            attempt().then(resolve).catch(reject);
          } else {
            reject(
              new Error(`Component failed to load after ${retries} attempts`),
            );
          }
        }, timeout);

        // Attempt to load the component
        factory()
          .then((component) => {
            clearTimeout(timeoutId);
            resolve(component);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            if (attempts < retries) {
              console.warn(
                `Error loading component, retrying (${attempts}/${retries})...`,
                error,
              );
              attempt().then(resolve).catch(reject);
            } else {
              reject(error);
            }
          });
      });
    };

    return attempt();
  });
}

/**
 * Preloads a component to improve perceived performance
 * @param factory Function that imports the component
 */
export function preloadComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): void {
  // Start loading the component in the background
  factory().catch((error) => {
    console.warn("Error preloading component:", error);
  });
}
