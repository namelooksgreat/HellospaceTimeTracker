import React from "react";

/**
 * Utilities for optimizing server-side rendering and hydration
 */

/**
 * Checks if the code is running on the server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Checks if the code is running on the client
 */
export function isClient(): boolean {
  return !isServer();
}

/**
 * Checks if the app is currently hydrating
 */
export function isHydrating(): boolean {
  if (isServer()) return false;

  // This is a simplified implementation
  // In a real app, you would use a more reliable method
  return document.documentElement.hasAttribute("data-hydrating");
}

/**
 * Runs a callback only on the client
 */
export function runOnClient(callback: () => void): void {
  if (isClient()) {
    callback();
  }
}

/**
 * Runs a callback only on the server
 */
export function runOnServer(callback: () => void): void {
  if (isServer()) {
    callback();
  }
}

/**
 * Runs a callback after hydration is complete
 */
export function runAfterHydration(callback: () => void): void {
  if (isServer()) return;

  if (isHydrating()) {
    // Wait for hydration to complete
    window.setTimeout(() => {
      runAfterHydration(callback);
    }, 50);
  } else {
    // Hydration is complete, run the callback
    callback();
  }
}

/**
 * Creates a version of a component that only renders on the client
 */
export function clientOnly<T extends React.ComponentType<any>>(
  Component: T,
): React.FC<React.ComponentProps<T>> {
  return function ClientOnlyComponent(props: React.ComponentProps<T>) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return React.createElement(Component, props);
  };
}
