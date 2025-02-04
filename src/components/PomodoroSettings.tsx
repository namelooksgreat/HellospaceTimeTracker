import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Timer, Clock, Hourglass } from "lucide-react";

export type PomodoroMode = "classic" | "long" | "short";

interface PomodoroSettingsProps {
  mode: PomodoroMode;
  onModeChange: (mode: PomodoroMode) => void;
}

const modes = [
  {
    value: "classic",
    label: "Classic (25/5)",
    description: "25 min work, 5 min break",
    icon: Timer,
  },
  {
    value: "long",
    label: "Long Focus (50/10)",
    description: "50 min work, 10 min break",
    icon: Clock,
  },
  {
    value: "short",
    label: "Short Focus (15/3)",
    description: "15 min work, 3 min break",
    icon: Hourglass,
  },
];

export function PomodoroSettings({
  mode,
  onModeChange,
}: PomodoroSettingsProps) {
  return (
    <div className="space-y-2">
      <Label>Pomodoro Mode</Label>
      <Select
        value={mode}
        onValueChange={(value) => onModeChange(value as PomodoroMode)}
      >
        <SelectTrigger className="h-12 bg-muted/50 border-input/50">
          <SelectValue placeholder="Select mode">
            <div className="flex items-center gap-2">
              {modes.find((m) => m.value === mode)?.icon && (
                <div className="flex items-center gap-2">
                  {React.createElement(
                    modes.find((m) => m.value === mode)?.icon!,
                    {
                      className: "h-4 w-4",
                    },
                  )}
                  {modes.find((m) => m.value === mode)?.label}
                </div>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {modes.map((m) => (
            <SelectItem
              key={m.value}
              value={m.value}
              className="py-3 cursor-pointer focus:bg-accent"
            >
              <div className="flex items-center gap-3">
                {React.createElement(m.icon, {
                  className: "h-4 w-4 text-primary",
                })}
                <div className="space-y-1">
                  <div className="font-medium">{m.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
