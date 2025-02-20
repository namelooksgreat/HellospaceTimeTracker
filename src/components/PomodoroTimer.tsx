import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Timer, Coffee, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  onTimerComplete?: () => void;
  className?: string;
}

export function PomodoroTimer({
  onTimerComplete,
  className,
}: PomodoroTimerProps) {
  const { language } = useLanguage();
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  const phaseDurations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const phaseLabels = {
    work: language === "tr" ? "Çalışma" : "Work",
    shortBreak: language === "tr" ? "Kısa Mola" : "Short Break",
    longBreak: language === "tr" ? "Uzun Mola" : "Long Break",
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (phase === "work") {
        setPomodorosCompleted((prev) => prev + 1);
        if (pomodorosCompleted === 3) {
          setPhase("longBreak");
          setTimeLeft(phaseDurations.longBreak);
          setPomodorosCompleted(0);
        } else {
          setPhase("shortBreak");
          setTimeLeft(phaseDurations.shortBreak);
        }
      } else {
        setPhase("work");
        setTimeLeft(phaseDurations.work);
      }
      onTimerComplete?.();
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, phase, pomodorosCompleted, onTimerComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(phaseDurations[phase]);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-background/80 via-background/50 to-background/30",
        "dark:from-black/80 dark:via-black/60 dark:to-black/40",
        "p-4 border border-border/50 rounded-xl",
        "transition-all duration-300",
        "shadow-lg hover:shadow-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {phase === "work" ? (
            <Brain className="h-5 w-5 text-primary" />
          ) : (
            <Coffee className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm font-medium">{phaseLabels[phase]}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {language === "tr" ? "Pomodoro" : "Pomodoro"} {pomodorosCompleted}/4
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="font-mono text-4xl font-bold">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleStartPause}
          className="flex-1"
          variant={isRunning ? "outline" : "default"}
        >
          {isRunning
            ? language === "tr"
              ? "Duraklat"
              : "Pause"
            : language === "tr"
              ? "Başlat"
              : "Start"}
        </Button>
        <Button onClick={handleReset} variant="outline" className="px-3">
          <Timer className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
