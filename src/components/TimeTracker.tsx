import React, { useState, useCallback, useEffect } from "react";
import { STORAGE_CONSTANTS } from "@/lib/constants/storage";
import { useMemoizedCallback } from "@/hooks/useMemoizedCallback";
import { useTimerStore } from "@/store/timerStore";
import { createTimeEntry } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
import { Card, CardContent } from "./ui/card";
import { showSuccess } from "@/lib/utils/toast";
import { handleError } from "@/lib/utils/error-handler";
import { ValidationError } from "@/config/errors";
import { ERROR_MESSAGES } from "@/config/errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Timer, Play, Pause, Square, Building2, RotateCcw } from "lucide-react";

interface TimeTrackerProps {
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers?: Array<{ id: string; name: string }>;
  availableTags?: Array<{ value: string; label: string }>;
  onTimeEntrySaved?: () => void;
}

function TimeTracker({
  projects = [],
  customers = [],
  availableTags = [],
  onTimeEntrySaved,
}: TimeTrackerProps) {
  const [taskName, setTaskName] = useState(() => {
    try {
      const saved = localStorage.getItem("timer_data");
      const savedData = saved ? JSON.parse(saved) : {};
      return savedData.taskName || "";
    } catch (error) {
      console.error("Error loading timer data:", error);
      return "";
    }
  });

  const [selectedProject, setSelectedProject] = useState(() => {
    try {
      const saved = localStorage.getItem("timer_data");
      const savedData = saved ? JSON.parse(saved) : {};
      return savedData.projectId || "";
    } catch (error) {
      console.error("Error loading timer data:", error);
      return "";
    }
  });

  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem("timer_data");
      const savedData = saved ? JSON.parse(saved) : {};
      return savedData.customerId || "";
    } catch (error) {
      console.error("Error loading timer data:", error);
      return "";
    }
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { state, time, start, pause, resume, stop, reset, setTime } =
    useTimerStore();

  const saveToLocalStorage = (data: {
    taskName: string;
    projectId: string;
    customerId: string;
  }) => {
    try {
      localStorage.setItem("timer_data", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving timer data:", error);
    }
  };

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  }, []);

  const formattedTime = formatTime(time);

  const handleTimerAction = useMemoizedCallback(() => {
    try {
      if (state === "stopped") start();
      else if (state === "running") pause();
      else if (state === "paused") resume();
    } catch (error) {
      handleError(error, "TimeTracker");
    }
  }, [state, start, pause, resume]);

  const handleStop = useMemoizedCallback(() => {
    pause();
    setShowSaveDialog(true);
  }, [pause]);

  const handleReset = useMemoizedCallback(() => {
    stop();
    reset();
    setTaskName("");
    setSelectedProject("");
    setSelectedCustomer("");
    localStorage.removeItem("timer_data");
  }, [stop, reset]);

  const handleSaveTimeEntry = useMemoizedCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      tags: string[];
    }) => {
      try {
        if (!data.taskName.trim()) {
          throw new ValidationError(ERROR_MESSAGES.TIME_TRACKING.INVALID_TASK, {
            componentName: "TimeTracker",
            action: "save_entry",
          });
        }

        const entry = {
          task_name: data.taskName,
          project_id: data.projectId || null,
          duration: Math.max(0, time),
          start_time: new Date().toISOString(),
          description: data.description || null,
        };

        await createTimeEntry(entry, data.tags);
        showSuccess("Time entry saved successfully");
        onTimeEntrySaved?.();
        reset();
        setShowSaveDialog(false);
      } catch (error) {
        handleError(error, "TimeTracker");
        setShowSaveDialog(false);
      }
    },
    [time, onTimeEntrySaved, reset],
  );

  return (
    <Card className="bg-gradient-to-b from-background/95 via-background/80 to-background/90 backdrop-blur-xl border-border/50 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 -mx-4 sm:mx-0">
      <CardContent className="p-3 space-y-3">
        {/* Timer Display */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/2 to-transparent border border-border/50 rounded-2xl p-3 transition-all duration-300 hover:shadow-xl hover:border-primary/20 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-grid-primary/5 mask-gradient" />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10">
                <Timer className="h-5 w-5" />
              </div>
              <div className="font-mono text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary flex items-center justify-center min-w-[120px] static">
                {formattedTime}
              </div>
            </div>
            {time > 0 && (
              <Button
                onClick={handleReset}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/50 shrink-0"
                title="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Customer and Project Selection */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-sm font-medium" htmlFor="customer-select">
              Customer
            </Label>
            <Select
              value={selectedCustomer}
              onValueChange={(value) => {
                setSelectedCustomer(value);
                setSelectedProject("");
                saveToLocalStorage({
                  taskName,
                  projectId: "",
                  customerId: value,
                });
              }}
            >
              <SelectTrigger
                id="customer-select"
                className="h-9 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm"
              >
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px] rounded-xl border-border/50">
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id}
                    className="py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium" htmlFor="project-select">
              Project
            </Label>
            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
                saveToLocalStorage({
                  taskName,
                  projectId: value,
                  customerId: selectedCustomer,
                });
              }}
              disabled={!selectedCustomer}
            >
              <SelectTrigger
                id="project-select"
                className="h-9 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm"
              >
                <SelectValue
                  placeholder={
                    selectedCustomer
                      ? "Select project"
                      : "Select customer first"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[280px] rounded-xl border-border/50">
                {projects
                  .filter((project) => project.customer_id === selectedCustomer)
                  .map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full ring-1 ring-border/50"
                          style={{ backgroundColor: project.color }}
                        />
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Name Input */}
        <div className="space-y-1">
          <Label className="text-sm font-medium" htmlFor="task-name">
            Task Name
          </Label>
          <Input
            id="task-name"
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => {
              const newValue = e.target.value;
              setTaskName(newValue);
              // Save to localStorage immediately and trigger storage event
              const timerData = {
                taskName: newValue,
                projectId: selectedProject,
                customerId: selectedCustomer,
              };
              try {
                localStorage.setItem(
                  STORAGE_CONSTANTS.TIMER.KEY,
                  JSON.stringify(timerData),
                );

                // Dispatch storage event for real-time sync
                window.dispatchEvent(
                  new StorageEvent("storage", {
                    key: STORAGE_CONSTANTS.TIMER.KEY,
                    newValue: JSON.stringify(timerData),
                  }),
                );
              } catch (error) {
                handleError(error, "TimeTracker");
              }
              // Dispatch storage event for real-time sync
              window.dispatchEvent(
                new StorageEvent("storage", {
                  key: STORAGE_CONSTANTS.TIMER.KEY,
                  newValue: JSON.stringify(timerData),
                }),
              );
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && state === "stopped") {
                handleTimerAction();
              }
            }}
            className="h-9 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm"
          />
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleTimerAction}
            variant={state === "paused" ? "outline" : "default"}
            className={`
              relative overflow-hidden flex-1 h-9 font-medium flex items-center justify-center gap-2 rounded-lg
              transition-all duration-300 shadow-lg hover:shadow-xl
              ${state === "running" ? "bg-primary hover:bg-primary/90 ring-1 ring-primary/50" : ""}
              ${state === "paused" ? "bg-muted text-muted-foreground hover:bg-muted/90 ring-1 ring-border/50" : ""}
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
              animate-slide-out-up
            `}
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
            onClick={handleStop}
            variant="destructive"
            className="h-9 w-9 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
            title="Stop and save timer"
            disabled={state === "stopped"}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <SaveTimeEntryDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        taskName={taskName}
        projectId={selectedProject}
        customerId={selectedCustomer}
        projects={projects}
        customers={customers}
        availableTags={availableTags}
        duration={time}
        onSave={handleSaveTimeEntry}
      />
    </Card>
  );
}

const MemoizedTimeTracker = React.memo(TimeTracker);
export default MemoizedTimeTracker;
