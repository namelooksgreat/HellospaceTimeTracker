import { renderHook, act } from "@testing-library/react";
import { useTimerStore } from "@/store/timerStore";

describe("Timer Persistence Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("persists timer state and continues after page reload", () => {
    // İlk render
    const { result, rerender } = renderHook(() => useTimerStore());

    // Timer'ı başlat ve biraz ilerlet
    act(() => {
      result.current.start();
      jest.advanceTimersByTime(5000); // 5 saniye ilerlet
    });

    // Sayfa yenilemesini simüle et
    rerender();

    // Timer durumunu kontrol et
    expect(result.current.state).toBe("running");
    expect(result.current.time).toBeGreaterThanOrEqual(5);

    // Biraz daha ilerlet
    act(() => {
      jest.advanceTimersByTime(3000); // 3 saniye daha ilerlet
    });

    // Toplam sürenin doğru olduğunu kontrol et
    expect(result.current.time).toBeGreaterThanOrEqual(8);
  });

  it("maintains timer state across multiple page reloads", () => {
    const { result, rerender } = renderHook(() => useTimerStore());

    // Timer'ı başlat
    act(() => {
      result.current.start();
      jest.advanceTimersByTime(5000);
    });

    // İlk yenileme
    rerender();
    expect(result.current.state).toBe("running");
    expect(result.current.time).toBeGreaterThanOrEqual(5);

    // İkinci yenileme
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    rerender();
    expect(result.current.time).toBeGreaterThanOrEqual(8);

    // Üçüncü yenileme
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    rerender();
    expect(result.current.time).toBeGreaterThanOrEqual(10);
  });

  it("correctly handles pause/resume across page reloads", () => {
    const { result, rerender } = renderHook(() => useTimerStore());

    // Timer'ı başlat ve duraklat
    act(() => {
      result.current.start();
      jest.advanceTimersByTime(5000);
      result.current.pause();
    });

    // Sayfa yenilemesi
    rerender();

    // Durumu kontrol et
    expect(result.current.state).toBe("paused");
    expect(result.current.time).toBe(5);

    // Devam et
    act(() => {
      result.current.resume();
      jest.advanceTimersByTime(3000);
    });

    // Tekrar yenile
    rerender();

    // Son durumu kontrol et
    expect(result.current.state).toBe("running");
    expect(result.current.time).toBeGreaterThanOrEqual(8);
  });
});
