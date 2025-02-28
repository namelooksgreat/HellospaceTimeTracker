import { lazy, ComponentType } from "react";

/**
 * Configuration for code splitting
 */
interface CodeSplittingConfig {
  // Paths that should be preloaded
  preloadPaths: string[];
  // Paths that should be loaded on demand
  onDemandPaths: string[];
}

// Default configuration
const defaultConfig: CodeSplittingConfig = {
  preloadPaths: ["/"],
  onDemandPaths: [],
};

// Current configuration
let config = { ...defaultConfig };

/**
 * Sets the code splitting configuration
 */
export function setCodeSplittingConfig(
  newConfig: Partial<CodeSplittingConfig>,
): void {
  config = { ...config, ...newConfig };
}

/**
 * Gets the current code splitting configuration
 */
export function getCodeSplittingConfig(): CodeSplittingConfig {
  return { ...config };
}

// A more flexible type for module imports that may or may not have default exports
type ModuleWithOptionalDefault<T> = { default: T } | T;

/**
 * Preloads a component
 */
export function preloadComponent<T>(
  importFn: () => Promise<ModuleWithOptionalDefault<T>>,
): void {
  importFn().catch((err) => {
    console.warn("Error preloading component:", err);
  });
}

/**
 * Creates a lazy-loaded component with preloading capability
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  shouldPreload: boolean = false,
): React.LazyExoticComponent<T> {
  if (shouldPreload) {
    // Type assertion to make TypeScript happy
    preloadComponent<T>(
      importFn as () => Promise<ModuleWithOptionalDefault<T>>,
    );
  }

  return lazy(importFn);
}

/**
 * Preloads components based on the current route
 */
export function preloadRouteComponents(currentPath: string): void {
  // This is a simplified implementation
  // In a real app, you would have a mapping of routes to components

  // Example: Preload profile components when on the profile page
  if (currentPath.startsWith("/profile")) {
    // Use type assertion to make TypeScript happy with the module imports
    preloadComponent<any>(
      () =>
        import("@/components/profile/ProfilePage") as Promise<
          ModuleWithOptionalDefault<any>
        >,
    );
    preloadComponent<any>(
      () =>
        import("@/components/profile/UserProfile") as Promise<
          ModuleWithOptionalDefault<any>
        >,
    );
  }

  // Example: Preload report components when on the reports page
  if (currentPath.startsWith("/reports")) {
    preloadComponent<any>(
      () =>
        import("@/components/reports/ReportsPage") as Promise<
          ModuleWithOptionalDefault<any>
        >,
    );
    preloadComponent<any>(
      () =>
        import("@/components/reports/DailyReport") as Promise<
          ModuleWithOptionalDefault<any>
        >,
    );
  }
}
