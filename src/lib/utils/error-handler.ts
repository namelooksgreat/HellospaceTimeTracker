import { toast } from "@/components/ui/use-toast";
import type { ErrorSeverity } from "@/config/errors";
import { ERROR_MESSAGES } from "@/config/errors";
import { logger } from "./logger";
import { trackError } from "./errorTracking";
import {
  AppError,
  ValidationError,
  NetworkError,
  AuthError,
} from "@/config/errors";

export function handleError(error: unknown, componentName?: string): void {
  // Already handled errors
  if (error instanceof AppError) {
    showErrorToast(error.message);
    logError(error, componentName);
    return;
  }

  // Network errors
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    const networkError = new NetworkError(ERROR_MESSAGES.NETWORK.OFFLINE, {
      componentName,
      code: "NET001",
    });
    showErrorToast(networkError.message);
    logError(networkError, componentName);
    return;
  }

  // Supabase errors
  if (isSupabaseError(error)) {
    handleSupabaseError(error, componentName);
    return;
  }

  // Unknown errors
  const unknownError = new AppError(ERROR_MESSAGES.NETWORK.SERVER_ERROR, {
    componentName,
    severity: "high",
    code: "UNK001",
    metadata: { originalError: error },
  });
  showErrorToast(unknownError.message);
  logError(unknownError, componentName);
}

function isSupabaseError(
  error: unknown,
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

function handleSupabaseError(
  error: { code: string; message: string },
  componentName?: string,
): void {
  let appError: AppError;

  switch (error.code) {
    case "PGRST301":
      appError = new AuthError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED, {
        code: "AUTH002",
        componentName,
      });
      break;
    case "PGRST404":
      appError = new ValidationError("Invalid input", {
        code: "VAL002",
        componentName,
      });
      break;
    default:
      appError = new AppError(ERROR_MESSAGES.NETWORK.SERVER_ERROR, {
        code: error.code,
        componentName,
        metadata: { originalError: error },
      });
  }

  showErrorToast(appError.message);
  logError(appError, componentName);
}

function showErrorToast(
  message: string,
  severity: ErrorSeverity = "medium",
): void {
  const config = {
    low: {
      title: "Info",
      variant: "default",
    },
    medium: {
      title: "Warning",
      variant: "warning",
    },
    high: {
      title: "Error",
      variant: "destructive",
    },
    critical: {
      title: "Critical Error",
      variant: "destructive",
    },
  };

  toast({
    title: config[severity].title,
    description: message,
    variant: (config[severity].variant === "warning"
      ? "default"
      : config[severity].variant) as "default" | "destructive",
  });
}

function logError(error: AppError, componentName?: string): void {
  logger.error(
    `[${componentName || "Unknown"}] ${error.name}: ${error.message}`,
    error,
  );
  trackError(error, error.context.severity || "high", {
    componentName,
    ...error.context,
  });
}

export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  componentName: string,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, componentName);
      throw error;
    }
  }) as T;
}
