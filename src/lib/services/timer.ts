export class Timer {
  private startTime: number | null = null;
  private pausedTime: number = 0;
  private lastSyncTime: number | null = null;
  private animationFrameId: number | null = null;
  private onTick: ((elapsedTime: number) => void) | null = null;
  private lastVisibilityTime: number | null = null;

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      if (this.startTime !== null) {
        // Save the current time when page becomes hidden
        this.lastVisibilityTime = performance.now();
        this.pausedTime = this.getElapsedTime();
        this.cleanup();
      }
    } else if (document.visibilityState === "visible") {
      if (this.lastVisibilityTime && this.onTick) {
        // Calculate time elapsed while hidden
        const hiddenDuration = performance.now() - this.lastVisibilityTime;
        const adjustedStartTime = performance.now() - hiddenDuration;

        // Resume from adjusted time
        this.start(this.onTick, this.pausedTime);
        this.startTime = adjustedStartTime;
      }
    }
  };

  start(onTick: (elapsedTime: number) => void, initialTime: number = 0): void {
    this.cleanup();
    this.startTime = performance.now();
    this.lastSyncTime = this.startTime;
    this.pausedTime = initialTime;
    this.onTick = onTick;
    this.tick();
  }

  private tick = () => {
    if (!this.startTime || !this.onTick || !this.lastSyncTime) return;

    const now = performance.now();
    const deltaTime = now - this.lastSyncTime;

    if (deltaTime >= 1000) {
      const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
      this.onTick(this.pausedTime + elapsedSeconds);
      this.lastSyncTime = now;
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  pause(): void {
    if (this.startTime === null) return;
    this.pausedTime = this.getElapsedTime();
    this.cleanup();
  }

  stop(): void {
    this.cleanup();
    this.pausedTime = 0;
  }

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.startTime = null;
    this.lastSyncTime = null;
  }

  private getElapsedTime(): number {
    if (!this.startTime) return this.pausedTime;

    const now = performance.now();
    const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
    return this.pausedTime + elapsedSeconds;
  }

  getCurrentTime(): number {
    return this.getElapsedTime();
  }
}

export const timer = new Timer();
