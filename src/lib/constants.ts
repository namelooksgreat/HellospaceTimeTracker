export const STORAGE_KEYS = {
  LAST_TASK_NAME: "lastTaskName",
  LAST_DESCRIPTION: "lastDescription",
  SELECTED_PROJECT_ID: "selectedProjectId",
  SELECTED_CUSTOMER_ID: "selectedCustomerId",
  THEME: "theme",
  USER_PREFERENCES: "userPreferences",
  THEME_PREFERENCE: "theme-preference",
} as const;

export const DEFAULT_TAGS = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Documentation" },
  { value: "design", label: "Design" },
  { value: "testing", label: "Testing" },
] as const;

export const POMODORO_DURATIONS = {
  classic: {
    work: 25 * 60, // 25 minutes
    break: 5 * 60, // 5 minutes
  },
  long: {
    work: 50 * 60, // 50 minutes
    break: 10 * 60, // 10 minutes
  },
  short: {
    work: 15 * 60, // 15 minutes
    break: 3 * 60, // 3 minutes
  },
} as const;

export const TIME_FORMAT_OPTIONS = {
  display: {
    time: {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    } as const,
    date: {
      year: "numeric",
      month: "long",
      day: "numeric",
    } as const,
  },
} as const;

export const API_CONFIG = {
  RETRY_ATTEMPTS: 1, // Reduced to 1 to fail fast
  TIMEOUT: 10000, // 10 seconds
  ERROR_MESSAGES: {
    NETWORK: "Network error occurred. Please check your connection.",
    SERVER: "Server error occurred. Please try again later.",
    AUTH: "Authentication error. Please log in again.",
    VALIDATION: "Validation error. Please check your input.",
  },
} as const;

export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^.{6,}$/,
  NAME: /^[\p{L}\s-]{2,50}$/u,
} as const;
