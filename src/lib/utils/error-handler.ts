import { toast } from "@/components/ui/use-toast";
import { trackError } from "./error-tracking";

type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorContext {
  componentName?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {},
    public severity: ErrorSeverity = "medium",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, context, "low");
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, context, "high");
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, context, "high");
    this.name = "AuthError";
  }
}

export function handleError(error: unknown, componentName?: string): void {
  const appError =
    error instanceof AppError
      ? error
      : new AppError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
          { componentName },
        );

  // Log error
  console.error(`[${componentName || "Unknown"}] ${appError.name}:`, appError);

  // Track error
  trackError(appError, appError.severity, {
    componentName,
    ...appError.context,
  });

  // Show toast notification
  toast({
    title: appError.name,
    description: appError.message,
    variant:
      appError.severity === "high" || appError.severity === "critical"
        ? "destructive"
        : "default",
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
