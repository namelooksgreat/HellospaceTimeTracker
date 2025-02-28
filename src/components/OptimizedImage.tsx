import { useState, useEffect } from "react";
import { preloadImage, isImageCached } from "@/lib/utils/image-optimization";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  placeholderSrc,
  fallbackSrc,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(
    isImageCached(src) ? src : placeholderSrc || src,
  );
  const [isLoaded, setIsLoaded] = useState(isImageCached(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Skip if already loaded or using fallback
    if (isLoaded || hasError || isImageCached(src)) return;

    let isMounted = true;

    preloadImage(src)
      .then(() => {
        if (isMounted) {
          setCurrentSrc(src);
          setIsLoaded(true);
          onLoad?.();
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
          if (fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
          onError?.();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc, isLoaded, hasError, onLoad, onError]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className || ""} ${!isLoaded ? "opacity-50 blur-sm" : "opacity-100"} transition-opacity duration-300`}
      loading="lazy"
      {...props}
    />
  );
}
