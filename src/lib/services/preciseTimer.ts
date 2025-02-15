export class PreciseTimer {
  private startTime: number | null = null;
  private elapsedTime: number = 0;
  private animationFrameId: number | null = null;
  private onTick: ((time: number) => void) | null = null;
  private lastVisibilityTime: number | null = null;
  private isRunning: boolean = false;

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
        // Save state before page becomes hidden
        this.lastVisibilityTime = performance.now();
        this.elapsedTime = this.getCurrentTime();
        this.cleanup();
      }
    } else if (document.visibilityState === "visible") {
      if (this.lastVisibilityTime && this.onTick) {
        // Calculate time passed while hidden
        const hiddenDuration = performance.now() - this.lastVisibilityTime;
        const elapsedSeconds = Math.floor(hiddenDuration / 1000);
        const newElapsedTime = this.elapsedTime + elapsedSeconds;

        // Restart timer with adjusted time
        this.start(this.onTick, newElapsedTime);
      }
    }
  };

  start(onTick: (time: number) => void, initialTime: number = 0) {
    if (this.isRunning) return; // Eğer zaten çalışıyorsa yeni timer başlatma

    this.cleanup();
    this.startTime = performance.now();
    this.elapsedTime = initialTime;
    this.onTick = onTick;
    this.isRunning = true;
    this.tick();
  }

  private tick = () => {
    if (!this.startTime || !this.onTick) return;

    const now = performance.now();
    const elapsedMs = now - this.startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const totalTime = this.elapsedTime + elapsedSeconds;

    this.onTick(totalTime);

    // Use requestAnimationFrame for smoother updates
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  pause() {
    this.elapsedTime = this.getCurrentTime();
    this.cleanup();
  }

  stop() {
    const finalTime = this.getCurrentTime();
    this.cleanup();
    this.elapsedTime = 0;
    return finalTime;
  }

  private cleanup() {
    if (this.animationFrameId !== null) {
      clearTimeout(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.startTime = null;
    this.isRunning = false;
  }

  getCurrentTime(): number {
    if (!this.startTime) return this.elapsedTime;

    const now = performance.now();
    const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
    return this.elapsedTime + elapsedSeconds;
  }
}

export const preciseTimer = new PreciseTimer();
