import { useLayoutEffect, useEffect } from "react";

// Prevent SSR errors by using useEffect on server and useLayoutEffect on client
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
