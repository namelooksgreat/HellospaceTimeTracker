import { renderHook, act } from "@testing-library/react";
import { useTimerStore } from "@/store/timerStore";

describe("Timer Behavior Reference Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("Basic Timer Operations", () => {
    it("starts from zero and counts up", () => {
      const { result } = renderHook(() => useTimerStore());

      // Initial state
      expect(result.current.state).toBe("stopped");
      expect(result.current.time).toBe(0);

      // Start timer
      act(() => {
        result.current.start();
      });

      // Advance time
      act(() => {
        jest.advanceTimersByTime(3000); // 3 seconds
      });

      expect(result.current.state).toBe("running");
      expect(result.current.time).toBe(3);
    });

    it("pauses and resumes correctly", () => {
      const { result } = renderHook(() => useTimerStore());

      // Start and accumulate time
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000); // 5 seconds
      });

      // Pause
      act(() => {
        result.current.pause();
      });

      const pausedTime = result.current.time;
      expect(result.current.state).toBe("paused");

      // Time should not increase while paused
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(result.current.time).toBe(pausedTime);

      // Resume
      act(() => {
        result.current.resume();
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.state).toBe("running");
      expect(result.current.time).toBe(pausedTime + 2);
    });

    it("stops and resets correctly", () => {
      const { result } = renderHook(() => useTimerStore());

      // Start and accumulate time
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
      });

      // Stop
      act(() => {
        result.current.stop();
      });

      expect(result.current.state).toBe("stopped");
      expect(result.current.time).toBe(5);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe("stopped");
      expect(result.current.time).toBe(0);
    });
  });

  describe("State Persistence", () => {
    it("maintains running state and time across reloads", () => {
      const { result, rerender } = renderHook(() => useTimerStore());

      // Start timer
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
      });

      // Simulate reload
      rerender();

      expect(result.current.state).toBe("running");
      expect(result.current.time).toBe(5);

      // Should continue counting
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.time).toBe(8);
    });

    it("maintains paused state and time across reloads", () => {
      const { result, rerender } = renderHook(() => useTimerStore());

      // Start and pause
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.pause();
      });

      const pausedTime = result.current.time;

      // Simulate reload
      rerender();

      expect(result.current.state).toBe("paused");
      expect(result.current.time).toBe(pausedTime);

      // Should stay paused
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.time).toBe(pausedTime);
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid start/pause/resume actions", () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.start();
        jest.advanceTimersByTime(1000);
        result.current.pause();
        result.current.resume();
        jest.advanceTimersByTime(1000);
        result.current.pause();
        result.current.resume();
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.time).toBe(3);
    });

    it("prevents negative time values", () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.stop();
      });

      expect(result.current.time).toBeGreaterThanOrEqual(0);
    });
  });
});
