import { TimerState } from "@/types/timer";
import { preciseTimer } from "@/lib/services/preciseTimer";

export class TimerCore {
  private static instance: TimerCore;
  private callbacks: Set<(time: number) => void> = new Set();
  private state: TimerState = "stopped";
  private time: number = 0;
  private startTime: number | null = null;

  private constructor() {}

  static getInstance(): TimerCore {
    if (!TimerCore.instance) {
      TimerCore.instance = new TimerCore();
    }
    return TimerCore.instance;
  }

  subscribe(callback: (time: number) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notify(): void {
    this.callbacks.forEach((callback) => callback(this.time));
  }

  start(): void {
    if (this.state === "running") return;

    this.state = "running";
    this.startTime = Date.now();
    preciseTimer.start(this.handleTick.bind(this));
  }

  pause(): void {
    if (this.state !== "running") return;

    this.state = "paused";
    this.time = this.getCurrentTime();
    preciseTimer.pause();
    this.notify();
  }

  resume(): void {
    if (this.state !== "paused") return;
    this.start();
  }

  stop(): void {
    this.state = "stopped";
    this.time = 0;
    this.startTime = null;
    preciseTimer.stop();
    this.notify();
  }

  private handleTick(): void {
    this.time = this.getCurrentTime();
    this.notify();
  }

  private getCurrentTime(): number {
    if (!this.startTime) return this.time;
    return Math.floor((Date.now() - this.startTime) / 1000) + this.time;
  }

  getState(): TimerState {
    return this.state;
  }

  getTime(): number {
    return this.getCurrentTime();
  }
}

export const timerCore = TimerCore.getInstance();
