import { useEffect, useRef, useState } from "react";

export function useInfiniteScroll(callback: () => void, threshold = 100) {
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observer.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isFetching) {
        setIsFetching(true);
        callback();
      }
    }, options);

    return () => observer.current?.disconnect();
  }, [callback, threshold, isFetching]);

  const observe = (element: HTMLElement | null) => {
    if (element && observer.current) {
      observer.current.observe(element);
    }
  };

  return { isFetching, setIsFetching, observe };
}
