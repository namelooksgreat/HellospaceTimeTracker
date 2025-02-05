export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^.{6,}$/,
  NAME: /^[\p{L}\s-]{2,50}$/u,
} as const;

export const ERROR_MESSAGES = {
  AUTH: {
    LOGIN_FAILED: "Login failed. Please check your credentials.",
    SESSION_EXPIRED: "Your session has expired. Please login again.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
    INVALID_CREDENTIALS: "Invalid email or password.",
  },
  TIME_TRACKING: {
    SAVE_FAILED: "Failed to save time entry. Please try again.",
    DELETE_FAILED: "Failed to delete time entry. Please try again.",
    UPDATE_FAILED: "Failed to update time entry. Please try again.",
    INVALID_DURATION: "Duration must be greater than 0.",
    INVALID_PROJECT: "Please select a valid project.",
    INVALID_TASK: "Task name is required.",
  },
  PROJECTS: {
    LOAD_FAILED: "Failed to load projects. Please refresh the page.",
    CREATE_FAILED: "Failed to create project. Please try again.",
    UPDATE_FAILED: "Failed to update project. Please try again.",
    DELETE_FAILED: "Failed to delete project. Please try again.",
  },
  CUSTOMERS: {
    LOAD_FAILED: "Failed to load customers. Please refresh the page.",
    CREATE_FAILED: "Failed to create customer. Please try again.",
    UPDATE_FAILED: "Failed to update customer. Please try again.",
    DELETE_FAILED: "Failed to delete customer. Please try again.",
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required.`,
    INVALID_EMAIL: "Please enter a valid email address.",
    INVALID_PASSWORD: "Password must be at least 6 characters long.",
    PASSWORDS_DONT_MATCH: "Passwords do not match.",
  },
  NETWORK: {
    OFFLINE: "You are offline. Please check your internet connection.",
    TIMEOUT: "Request timed out. Please try again.",
    SERVER_ERROR: "Server error occurred. Please try again later.",
  },
  UI: {
    FORM_SUBMIT_FAILED: "Failed to submit form. Please try again.",
    INVALID_INPUT: "Please check your input and try again.",
    UNSAVED_CHANGES:
      "You have unsaved changes. Are you sure you want to leave?",
  },
} as const;

export const ERROR_CODES = {
  AUTH: {
    INVALID_CREDENTIALS: "AUTH001",
    SESSION_EXPIRED: "AUTH002",
    UNAUTHORIZED: "AUTH003",
  },
  TIME_TRACKING: {
    SAVE_FAILED: "TIME001",
    DELETE_FAILED: "TIME002",
    UPDATE_FAILED: "TIME003",
  },
  VALIDATION: {
    REQUIRED_FIELD: "VAL001",
    INVALID_FORMAT: "VAL002",
  },
  NETWORK: {
    OFFLINE: "NET001",
    TIMEOUT: "NET002",
    SERVER_ERROR: "NET003",
  },
} as const;

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorContext {
  code?: string;
  severity?: ErrorSeverity;
  componentName?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, { ...context, severity: "medium" });
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, { ...context, severity: "high" });
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, { ...context, severity: "high" });
    this.name = "AuthError";
  }
}
