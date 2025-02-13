type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorContext {
  componentName?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: string;
  context: ErrorContext;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorReport[] = [];

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  track(error: Error, severity: ErrorSeverity, context: ErrorContext): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      severity,
      timestamp: new Date().toISOString(),
      context,
    };

    this.errors.push(errorReport);
    this.logError(errorReport);
  }

  private logError(report: ErrorReport): void {
    const { severity, message, context } = report;
    const prefix = `[${severity.toUpperCase()}] ${context.componentName || "Unknown"}`;

    switch (severity) {
      case "critical":
      case "high":
        console.error(`${prefix}: ${message}`, report);
        break;
      case "medium":
        console.warn(`${prefix}: ${message}`, report);
        break;
      case "low":
        console.info(`${prefix}: ${message}`, report);
        break;
    }
  }

  getErrors(): ErrorReport[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorTracker = ErrorTracker.getInstance();

export function trackError(
  error: Error,
  severity: ErrorSeverity,
  context: ErrorContext,
): void {
  errorTracker.track(error, severity, context);
}
