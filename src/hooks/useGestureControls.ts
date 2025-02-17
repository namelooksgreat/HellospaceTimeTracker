import { useEffect, useRef } from "react";

interface GestureConfig {
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
}

export function useGestureControls(config: GestureConfig = {}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const gestureRef = useRef({
    startDistance: 0,
    startAngle: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Pinch başlangıç mesafesi
        gestureRef.current.startDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );

        // Rotasyon başlangıç açısı
        gestureRef.current.startAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX,
        );
      } else if (e.touches.length === 1) {
        gestureRef.current.startX = e.touches[0].clientX;
        gestureRef.current.startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Pinch
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        const scale = currentDistance / gestureRef.current.startDistance;
        config.onPinch?.(scale);

        // Rotasyon
        const currentAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX,
        );
        const angle =
          (currentAngle - gestureRef.current.startAngle) * (180 / Math.PI);
        config.onRotate?.(angle);
      } else if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - gestureRef.current.startX;
        const deltaY = e.touches[0].clientY - gestureRef.current.startY;
        config.onPan?.(deltaX, deltaY);
      }
    };

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, [config]);

  return elementRef as React.RefObject<HTMLDivElement>;
}
