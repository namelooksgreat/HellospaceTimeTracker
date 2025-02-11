import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { styles } from "@/components/ui/styles";

interface TimerControlsProps {
  state: "stopped" | "running" | "paused";
  onTimerAction: () => void;
  onStop: () => void;
}

export function TimerControls({
  state,
  onTimerAction,
  onStop,
}: TimerControlsProps) {
  return (
    <div className="flex gap-2 pt-1">
      <Button
        onClick={onTimerAction}
        variant={state === "paused" ? "outline" : "default"}
        className={cn(styles.components.timerButton, {
          [styles.components.timerButtonRunning]: state === "running",
          [styles.components.timerButtonPaused]: state === "paused",
        })}
      >
        {(state === "stopped" || !state) && (
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 animate-pulse" />
            <span>Start Timer</span>
          </div>
        )}
        {state === "running" && (
          <>
            <Pause className="h-4 w-4" />
            <span>Pause Timer</span>
          </>
        )}
        {state === "paused" && (
          <>
            <Play className="h-4 w-4 animate-pulse" />
            <span className="relative inline-block overflow-hidden">
              <span className="inline-block animate-slide-out-up">
                Resume Timer
              </span>
            </span>
          </>
        )}
      </Button>

      <Button
        onClick={onStop}
        variant="destructive"
        className={cn(styles.components.stopButton)}
        size="icon"
        title="Stop and save timer"
        disabled={state === "stopped"}
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
}
