import { act, renderHook } from "@testing-library/react";
import { useTimerStore, cleanupTimer } from "@/store/timerStore";
import { supabase } from "@/lib/supabase";

// Mock Supabase Auth
const mockUser1 = { id: "test-user-1", email: "test1@example.com" };
const mockUser2 = { id: "test-user-2", email: "test2@example.com" };

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

describe("Timer Store Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    jest.spyOn(supabase.auth, "getUser").mockResolvedValue({
      data: { user: mockUser1 },
      error: null,
    });
  });

  afterEach(() => {
    cleanupTimer();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("User-specific Storage", () => {
    it("stores timer state with user-specific key", async () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
      });

      const storageKey = `timer_${mockUser1.id}`;
      const storedData = localStorage.getItem(storageKey);
      expect(storedData).toBeTruthy();

      const parsedData = JSON.parse(storedData!);
      expect(parsedData.state).toBe("running");
      expect(parsedData.time).toBe(5);
    });

    it("maintains separate states for different users", async () => {
      // First user starts timer
      const { result: result1 } = renderHook(() => useTimerStore());
      act(() => {
        result1.current.start();
        jest.advanceTimersByTime(5000);
      });

      // Switch to second user
      jest.spyOn(supabase.auth, "getUser").mockResolvedValue({
        data: { user: mockUser2 },
        error: null,
      });

      const { result: result2 } = renderHook(() => useTimerStore());
      expect(result2.current.time).toBe(0);
      expect(result2.current.state).toBe("stopped");

      // Start second user's timer
      act(() => {
        result2.current.start();
        jest.advanceTimersByTime(3000);
      });

      // Verify separate storage
      const user1Storage = localStorage.getItem(`timer_${mockUser1.id}`);
      const user2Storage = localStorage.getItem(`timer_${mockUser2.id}`);

      const user1Data = JSON.parse(user1Storage!);
      const user2Data = JSON.parse(user2Storage!);

      expect(user1Data.time).toBe(5);
      expect(user2Data.time).toBe(3);
    });

    it("auto-saves timer state periodically", async () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.start();
        jest.advanceTimersByTime(1000);
      });

      const storageKey = `timer_${mockUser1.id}`;
      const initialData = JSON.parse(localStorage.getItem(storageKey)!);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const updatedData = JSON.parse(localStorage.getItem(storageKey)!);
      expect(updatedData.time).toBeGreaterThan(initialData.time);
    });

    it("clears timer state on explicit stop", async () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.stop();
      });

      const storageKey = `timer_${mockUser1.id}`;
      const storedData = JSON.parse(localStorage.getItem(storageKey)!);
      expect(storedData.state).toBe("stopped");
      expect(storedData.time).toBe(0);
    });
  });
});
