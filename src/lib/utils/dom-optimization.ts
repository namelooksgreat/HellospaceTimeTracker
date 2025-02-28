/**
 * Utilities for optimizing DOM operations
 */

// Queue for batching DOM operations
const readQueue: Array<() => void> = [];
const writeQueue: Array<() => void> = [];
let scheduledFrame = 0;

/**
 * Schedules a DOM read operation
 * @param callback Function that reads from the DOM
 */
export function scheduleRead(callback: () => void): void {
  readQueue.push(callback);
  scheduleFrame();
}

/**
 * Schedules a DOM write operation
 * @param callback Function that writes to the DOM
 */
export function scheduleWrite(callback: () => void): void {
  writeQueue.push(callback);
  scheduleFrame();
}

/**
 * Schedules a frame to process queued operations
 */
function scheduleFrame(): void {
  if (scheduledFrame) return;

  scheduledFrame = requestAnimationFrame(processQueues);
}

/**
 * Processes all queued read and write operations
 */
function processQueues(): void {
  // Process all reads first to avoid layout thrashing
  const reads = readQueue.slice();
  readQueue.length = 0;

  reads.forEach((read) => {
    try {
      read();
    } catch (error) {
      console.error("Error in scheduled DOM read:", error);
    }
  });

  // Then process all writes
  const writes = writeQueue.slice();
  writeQueue.length = 0;

  writes.forEach((write) => {
    try {
      write();
    } catch (error) {
      console.error("Error in scheduled DOM write:", error);
    }
  });

  scheduledFrame = 0;

  // If new operations were added during processing, schedule another frame
  if (readQueue.length > 0 || writeQueue.length > 0) {
    scheduleFrame();
  }
}

/**
 * Measures an element's dimensions without causing layout thrashing
 * @param element The element to measure
 * @param callback Function that receives the element's dimensions
 */
export function measureElement(
  element: HTMLElement,
  callback: (rect: DOMRect) => void,
): void {
  scheduleRead(() => {
    const rect = element.getBoundingClientRect();
    scheduleWrite(() => callback(rect));
  });
}

/**
 * Optimizes animations by using requestAnimationFrame
 * @param callback Animation frame callback
 * @param duration Animation duration in milliseconds
 */
export function animateElement(
  callback: (progress: number) => void,
  duration: number = 300,
): { cancel: () => void } {
  const startTime = performance.now();
  let frameId = 0;

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    callback(progress);

    if (progress < 1) {
      frameId = requestAnimationFrame(animate);
    }
  }

  frameId = requestAnimationFrame(animate);

  return {
    cancel: () => {
      if (frameId) cancelAnimationFrame(frameId);
    },
  };
}
