export const TIMER_CONSTANTS = {
  STORAGE: {
    KEY: "timer_data",
    AUTO_SAVE_INTERVAL: 1000,
    USER_PREFIX: "timer_",
  },
  DURATIONS: {
    POMODORO: {
      CLASSIC: { work: 25 * 60, break: 5 * 60 },
      LONG: { work: 50 * 60, break: 10 * 60 },
      SHORT: { work: 15 * 60, break: 3 * 60 },
    },
  },
  SYNC: {
    INTERVAL: 1000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
} as const;

export const TIMER_EVENTS = {
  STATE_CHANGE: "timerStateChange",
  SYNC: "timerSync",
  ERROR: "timerError",
} as const;
