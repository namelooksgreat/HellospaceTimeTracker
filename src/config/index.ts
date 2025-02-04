export const APP_CONFIG = {
  name: "Time Tracking App",
  version: "1.0.0",
  api: {
    baseUrl: import.meta.env.VITE_SUPABASE_URL,
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  ui: {
    theme: {
      default: "dark",
      storageKey: "theme",
    },
    toast: {
      duration: 5000,
      position: "bottom-right",
    },
  },
  timeTracking: {
    minDuration: 60, // 1 minute
    maxDuration: 86400, // 24 hours
    autoSaveInterval: 30000, // 30 seconds
  },
} as const;

export const ROUTES = {
  home: "/",
  auth: "/auth",
  admin: "/admin",
  settings: "/settings",
  notFound: "*",
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
  },
  users: "/users",
  timeEntries: "/time-entries",
  projects: "/projects",
  customers: "/customers",
} as const;

export const STORAGE_KEYS = {
  theme: "theme",
  lastTaskName: "lastTaskName",
  lastDescription: "lastDescription",
  selectedProjectId: "selectedProjectId",
  selectedCustomerId: "selectedCustomerId",
  userPreferences: "userPreferences",
} as const;

export const TIME_FORMATS = {
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
