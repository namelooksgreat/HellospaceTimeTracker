import { STORAGE_KEYS } from "@/lib/constants";

export type TimerState = "stopped" | "running" | "paused" | "break";

type TimerAction =
  | { type: "START"; startTime: string }
  | { type: "PAUSE" }
  | { type: "RESUME"; startTime: string }
  | { type: "STOP" }
  | { type: "RESET" }
  | { type: "TICK"; delta: number };

interface TimerStateShape {
  status: TimerState;
  time: number;
  startTime: string | null;
}

export function timerReducer(
  state: TimerStateShape,
  action: TimerAction,
): TimerStateShape {
  switch (action.type) {
    case "START":
      return {
        ...state,
        status: "running",
        startTime: action.startTime,
      };

    case "PAUSE":
      return {
        ...state,
        status: "paused",
        startTime: null,
      };

    case "RESUME":
      return {
        ...state,
        status: "running",
        startTime: action.startTime,
      };

    case "STOP":
      return {
        ...state,
        status: "stopped",
        startTime: null,
      };

    case "RESET":
      return {
        status: "stopped",
        time: 0,
        startTime: null,
      };

    case "TICK":
      return {
        ...state,
        time: state.time + action.delta,
      };

    default:
      return state;
  }
}

export function persistTimerState(state: TimerStateShape) {
  localStorage.setItem(STORAGE_KEYS.TIMER_STATE, state.status);
  localStorage.setItem(STORAGE_KEYS.TIMER_ELAPSED, state.time.toString());
  if (state.startTime) {
    localStorage.setItem(STORAGE_KEYS.TIMER_START, state.startTime);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER_START);
  }
}

export function loadTimerState(): TimerStateShape {
  return {
    status:
      (localStorage.getItem(STORAGE_KEYS.TIMER_STATE) as TimerState) ||
      "stopped",
    time: parseInt(localStorage.getItem(STORAGE_KEYS.TIMER_ELAPSED) || "0", 10),
    startTime: localStorage.getItem(STORAGE_KEYS.TIMER_START),
  };
}
