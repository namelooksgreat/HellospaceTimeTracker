import { toast } from "sonner";

type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorContext {
  componentName?: string;
  action?: string;
  metadata?: Record<string, any>;
  data?: unknown;
  errorInfo?: unknown;
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

  // Show toast notification
  if (appError.severity === "high" || appError.severity === "critical") {
    toast.error(appError.message, {
      description: `Error in ${componentName || "Unknown component"}`,
    });
  } else if (appError.severity === "medium") {
    toast.warning(appError.message, {
      description: `Warning in ${componentName || "Unknown component"}`,
    });
  }

  // You could add error tracking service integration here
  // trackError(appError);
}
