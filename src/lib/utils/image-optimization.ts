/**
 * Utilities for optimizing image loading and rendering
 */

// Cache for preloaded images
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Preloads an image to improve perceived performance
 * @param src Image source URL
 * @returns A promise that resolves when the image is loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  // Return from cache if already loaded
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = src;
  });
}

/**
 * Checks if an image is already cached
 * @param src Image source URL
 */
export function isImageCached(src: string): boolean {
  return imageCache.has(src);
}

/**
 * Clears the image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Gets a properly sized avatar URL based on the desired dimensions
 * @param email User email for generating avatar
 * @param size Desired size in pixels
 */
export function getOptimizedAvatarUrl(
  email: string,
  size: number = 40,
): string {
  // Use DiceBear with size parameter for optimized loading
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&size=${size}`;
}

/**
 * Creates a low-quality image placeholder URL
 * @param originalUrl The original image URL
 */
export function createImagePlaceholder(originalUrl: string): string {
  // This is a simplified implementation
  // In a real app, you might use a service like Cloudinary or a backend endpoint
  return originalUrl;
}
