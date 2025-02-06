import { TimerService } from "@/lib/timer/TimerService";

describe("TimerService", () => {
  let timerService: TimerService;

  beforeEach(() => {
    timerService = TimerService.getInstance();
  });

  afterEach(() => {
    timerService.cleanup();
  });

  it("should handle concurrent timer operations", async () => {
    const userId = "test-user";
    const mockData = {
      state: "running" as const,
      time: 0,
      start_time: new Date().toISOString(),
    };

    await Promise.all([
      timerService.startTimer(userId, mockData),
      timerService.startTimer(userId, mockData),
    ]);

    expect(timerService["intervals"].size).toBe(1);
  });

  it("should cleanup resources properly", () => {
    const userId = "test-user";
    timerService.startTimer(userId, {
      state: "running",
      time: 0,
      start_time: new Date().toISOString(),
    });

    timerService.cleanup();

    expect(timerService["intervals"].size).toBe(0);
    expect(timerService["syncIntervals"].size).toBe(0);
  });
});
