import { renderHook, act } from "@testing-library/react";
import { useTimerStore } from "@/store/timerStore";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

describe("Timer Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("Timer Basic Operations", () => {
    it("starts from zero", () => {
      const { result } = renderHook(() => useTimerStore());
      expect(result.current.time).toBe(0);
      expect(result.current.state).toBe("stopped");
    });

    it("increments time correctly", () => {
      const { result } = renderHook(() => useTimerStore());
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
      });
      expect(result.current.time).toBe(5);
    });

    it("pauses correctly", () => {
      const { result } = renderHook(() => useTimerStore());
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.pause();
        jest.advanceTimersByTime(3000);
      });
      expect(result.current.time).toBe(5);
    });

    it("resumes from correct time", () => {
      const { result } = renderHook(() => useTimerStore());
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.pause();
        result.current.resume();
        jest.advanceTimersByTime(3000);
      });
      expect(result.current.time).toBe(8);
    });

    it("resets correctly", () => {
      const { result } = renderHook(() => useTimerStore());
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.reset();
      });
      expect(result.current.time).toBe(0);
      expect(result.current.state).toBe("stopped");
    });
  });

  describe("Timer State Persistence", () => {
    it("persists state across reloads", () => {
      const { result, rerender } = renderHook(() => useTimerStore());
      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
      });
      rerender();
      expect(result.current.time).toBe(5);
    });

    it("maintains separate states for different users", () => {
      // Mock different user sessions
      const mockUser1 = { id: "user1", email: "user1@test.com" };
      const mockUser2 = { id: "user2", email: "user2@test.com" };

      // Setup for first user
      jest.spyOn(supabase.auth, "getSession").mockResolvedValue({
        data: { session: { user: mockUser1 } as Session },
        error: null,
      });
      const { result: result1 } = renderHook(() => useTimerStore());

      act(() => {
        result1.current.start();
        jest.advanceTimersByTime(5000);
      });

      // Switch to second user
      jest.spyOn(supabase.auth, "getSession").mockImplementation(() =>
        Promise.resolve({
          data: { session: { user: mockUser2 } as Session },
          error: null,
        }),
      );
      const { result: result2 } = renderHook(() => useTimerStore());

      expect(result2.current.time).toBe(0);
      expect(result2.current.state).toBe("stopped");
    });
  });
});
