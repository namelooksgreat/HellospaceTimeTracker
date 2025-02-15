import { preciseTimer } from "@/lib/services/preciseTimer";

describe("PreciseTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    preciseTimer.stop();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sürekli çalışmaya devam etmeli ve durdurana kadar saymalı", () => {
    const mockCallback = jest.fn();
    preciseTimer.start(mockCallback);

    // 5 saniye ilerlet
    jest.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledWith(5);

    // 5 saniye daha ilerlet
    jest.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledWith(10);

    // Timer hala çalışıyor olmalı
    expect(mockCallback).toHaveBeenCalled();
  });

  it("aynı anda birden fazla timer başlatılmamalı", () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();

    preciseTimer.start(mockCallback1);
    preciseTimer.start(mockCallback2); // Bu çağrı görmezden gelinmeli

    jest.advanceTimersByTime(1000);

    // Sadece ilk callback çağrılmalı
    expect(mockCallback1).toHaveBeenCalled();
    expect(mockCallback2).not.toHaveBeenCalled();
  });

  it("durdurulduğunda sayma işlemi durmalı", () => {
    const mockCallback = jest.fn();
    preciseTimer.start(mockCallback);

    jest.advanceTimersByTime(3000);
    expect(mockCallback).toHaveBeenCalledWith(3);

    preciseTimer.stop();

    jest.advanceTimersByTime(2000);
    // Son çağrıdan sonra değişmemeli
    expect(mockCallback).toHaveBeenLastCalledWith(3);
  });

  it("duraklatıldığında mevcut süreyi korumalı", () => {
    const mockCallback = jest.fn();
    preciseTimer.start(mockCallback);

    jest.advanceTimersByTime(5000);
    preciseTimer.pause();

    jest.advanceTimersByTime(3000);
    // Duraklatıldıktan sonra süre artmamalı
    expect(mockCallback).toHaveBeenLastCalledWith(5);

    preciseTimer.resume();
    jest.advanceTimersByTime(2000);
    // Devam ettikten sonra kaldığı yerden saymalı
    expect(mockCallback).toHaveBeenLastCalledWith(7);
  });
});
