import { toast } from "sonner";
import { secureLogger, sanitizeErrorMessage } from "./secure-logging";
import { createUserFriendlyError } from "./error-sanitizer";

export function handleError(error: unknown, componentName?: string): void {
  // Log the error securely without exposing sensitive information
  secureLogger.error(
    `Error in ${componentName || "unknown component"}:`,
    error,
  );

  // Create a user-friendly error message
  const { message } = createUserFriendlyError(error);

  // Show a sanitized toast message to the user
  toast.error(message);
}
