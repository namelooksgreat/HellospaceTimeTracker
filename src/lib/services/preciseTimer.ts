export class PreciseTimer {
  private static instance: PreciseTimer;
  private startTime: number | null = null;
  private baseTime: number = 0;
  private animationFrameId: number | null = null;
  private callback: ((elapsed: number) => void) | null = null;

  private constructor() {}

  static getInstance(): PreciseTimer {
    if (!PreciseTimer.instance) {
      PreciseTimer.instance = new PreciseTimer();
    }
    return PreciseTimer.instance;
  }

  start(
    callback: (elapsedSeconds: number) => void,
    initialTime: number = 0,
  ): void {
    this.cleanup();
    this.startTime = performance.now();
    this.baseTime = initialTime;
    this.callback = callback;
    this.tick();
  }

  private tick = () => {
    if (!this.startTime || !this.callback) return;

    const now = performance.now();
    const elapsed = Math.floor((now - this.startTime) / 1000);
    this.callback(this.baseTime + elapsed);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  stop(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.startTime = null;
    this.baseTime = 0;
    this.callback = null;
  }
}

export const preciseTimer = PreciseTimer.getInstance();
