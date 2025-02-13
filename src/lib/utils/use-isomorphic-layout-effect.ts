import { useEffect, useLayoutEffect } from "react";

// On the server, React emits a warning when calling useLayoutEffect.
// This is because useLayoutEffect runs synchronously in the browser
// but is deferred on the server.
// To get around this, we can conditionally useEffect on the server
// and useLayoutEffect in the browser.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
