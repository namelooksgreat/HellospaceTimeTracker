export const APP_CONFIG = {
  version: "1.0.0",
  env: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  },
  timer: {
    autoSaveInterval: 1000,
    syncInterval: 1000,
    maxDuration: 24 * 60 * 60, // 24 hours
    minDuration: 1, // 1 second
  },
  storage: {
    prefix: "hellospace_tracker_",
    version: "v1",
  },
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
} as const;
