import { renderHook, act } from "@testing-library/react";
import { useTimer } from "../useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("initial state", () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.timerState).toBe("stopped");
    expect(result.current.time).toBe(0);
  });

  test("start timer", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
    });
    expect(result.current.timerState).toBe("running");
  });

  test("pause timer", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
      result.current.pause();
    });
    expect(result.current.timerState).toBe("paused");
  });

  test("resume timer", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
      result.current.pause();
      result.current.resume();
    });
    expect(result.current.timerState).toBe("running");
  });

  test("time increment", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.time).toBe(1);
  });

  test("persistence", () => {
    const { result, rerender } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
      jest.advanceTimersByTime(5000);
    });
    rerender();
    expect(result.current.time).toBe(5);
  });
});
