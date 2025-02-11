import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  formattedTime: string;
  state: "stopped" | "running" | "paused";
}

export function TimerDisplay({ formattedTime, state }: TimerDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10 overflow-hidden group/icon">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
              <Clock
                className={cn(
                  "relative h-5 w-5 transition-all duration-300",
                  state === "running" && "animate-timer-pulse",
                  "group-hover/icon:scale-110 group-hover/icon:text-primary",
                )}
              />
            </div>
            <div className="text-sm font-medium text-muted-foreground/80">
              {state === "running"
                ? "Timer Running"
                : state === "paused"
                  ? "Timer Paused"
                  : "Timer Stopped"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary relative">
            {formattedTime}
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
