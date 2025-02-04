export const STORAGE_KEYS = {
  LAST_TASK_NAME: "lastTaskName",
  LAST_DESCRIPTION: "lastDescription",
  SELECTED_PROJECT_ID: "selectedProjectId",
  SELECTED_CUSTOMER_ID: "selectedCustomerId",
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
    work: 25 * 60,
    break: 5 * 60,
  },
  long: {
    work: 50 * 60,
    break: 10 * 60,
  },
  short: {
    work: 15 * 60,
    break: 3 * 60,
  },
} as const;

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};
