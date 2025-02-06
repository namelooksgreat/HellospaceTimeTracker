import { renderHook, act } from "@testing-library/react";
import { useTimerStore } from "@/store/timerStore";
import { createTimeEntry, getTimeEntries } from "@/lib/api";
import { supabase } from "@/lib/supabase";

describe("Time Entry Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("Time Entry Creation", () => {
    it("creates time entry with correct duration", async () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.start();
        jest.advanceTimersByTime(5000);
        result.current.stop();
      });

      const entry = {
        task_name: "Test Task",
        duration: result.current.time,
        start_time: new Date().toISOString(),
      };

      const mockCreateEntry = jest.spyOn(
        supabase.from("time_entries"),
        "insert",
      );
      await createTimeEntry(entry);

      expect(mockCreateEntry).toHaveBeenCalledWith([
        expect.objectContaining({
          task_name: entry.task_name,
          duration: 5,
        }),
      ]);
    });

    it("persists time entries correctly", async () => {
      const mockEntries = [
        {
          id: "1",
          task_name: "Test Task",
          duration: 300,
          start_time: new Date().toISOString(),
        },
      ];

      jest.spyOn(supabase, "from").mockReturnValue({
        select: () => Promise.resolve({ data: mockEntries, error: null }),
      } as any);

      const entries = await getTimeEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].task_name).toBe("Test Task");
    });
  });

  describe("Time Entry Validation", () => {
    it("validates required fields", async () => {
      const invalidEntry = {
        duration: 300,
        start_time: new Date().toISOString(),
      };

      await expect(createTimeEntry(invalidEntry)).rejects.toThrow();
    });

    it("handles invalid duration values", async () => {
      const invalidEntry = {
        task_name: "Test Task",
        duration: -1,
        start_time: new Date().toISOString(),
      };

      await expect(createTimeEntry(invalidEntry)).rejects.toThrow();
    });
  });
});
