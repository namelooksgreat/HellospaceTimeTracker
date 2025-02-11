import { renderHook, act } from "@testing-library/react";
import { useTimerStore } from "@/store/timerStore";
import { preciseTimer } from "@/lib/services/preciseTimer";

jest.mock("@/lib/services/preciseTimer", () => ({
  preciseTimer: {
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

describe("Timer Core Behavior Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    (preciseTimer.start as jest.Mock).mockClear();
    (preciseTimer.stop as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("Timer State Management", () => {
    it("maintains state across page reloads", () => {
      const { result } = renderHook(() => useTimerStore());

      // Start timer
      act(() => {
        result.current.start();
      });

      // Store current state
      const currentState = {
        state: result.current.state,
        time: result.current.time,
      };

      // Simulate page reload by re-rendering hook
      const { result: reloadedResult } = renderHook(() => useTimerStore());

      // State should persist
      expect(reloadedResult.current.state).toBe(currentState.state);
      expect(reloadedResult.current.time).toBe(currentState.time);
    });

    it("resumes timer from correct time after reload", () => {
      const { result } = renderHook(() => useTimerStore());

      // Start and accumulate some time
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000); // 5 seconds
      });

      // Store current time
      const timeBeforeReload = result.current.time;

      // Simulate reload
      const { result: reloadedResult } = renderHook(() => useTimerStore());

      // Timer should resume from previous time
      expect(reloadedResult.current.time).toBe(timeBeforeReload);

      // Should continue counting from previous time
      act(() => {
        jest.advanceTimersByTime(3000); // 3 more seconds
      });

      expect(reloadedResult.current.time).toBe(timeBeforeReload + 3);
    });

    it("maintains paused state and time across reloads", () => {
      const { result } = renderHook(() => useTimerStore());

      // Start, accumulate time, then pause
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.pause();
      });

      const pausedTime = result.current.time;

      // Simulate reload
      const { result: reloadedResult } = renderHook(() => useTimerStore());

      // Should maintain paused state and time
      expect(reloadedResult.current.state).toBe("paused");
      expect(reloadedResult.current.time).toBe(pausedTime);
    });
  });
});
