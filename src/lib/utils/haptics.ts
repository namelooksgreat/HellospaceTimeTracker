/**
 * Utility functions for haptic feedback on mobile devices
 */

/**
 * Trigger a light haptic feedback (short vibration)
 * Used for regular interactions like button presses
 */
export function lightHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

/**
 * Trigger a medium haptic feedback
 * Used for more significant actions like starting/stopping a timer
 */
export function mediumHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

/**
 * Trigger a strong haptic feedback
 * Used for important actions like completing a task or error states
 */
export function strongHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate([30, 30, 30]);
  }
}

/**
 * Trigger a success haptic feedback pattern
 * Used when an action completes successfully
 */
export function successHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate([10, 30, 20]);
  }
}

/**
 * Trigger an error haptic feedback pattern
 * Used when an action fails or for error states
 */
export function errorHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate([30, 20, 40, 20]);
  }
}

/**
 * Trigger a warning haptic feedback pattern
 * Used for warning states or to get user attention
 */
export function warningHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate([20, 40, 20]);
  }
}

/**
 * Check if haptic feedback is supported on the current device
 */
export function isHapticFeedbackSupported(): boolean {
  return !!navigator.vibrate;
}
