import React, { useCallback } from "react";
import { useTimerStore } from "@/store/timerStore";
import { useTimerDataStore } from "@/store/timerDataStore";
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
import { styles } from "./ui/styles";
import { cn } from "@/lib/utils";
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
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);

  const { state, time, start, pause, resume, stop, reset } = useTimerStore();
  const {
    taskName,
    projectId: selectedProject,
    customerId: selectedCustomer,
    setTaskName,
    setProjectId,
    setCustomerId,
    reset: resetTimerData,
  } = useTimerDataStore();

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  }, []);

  const formattedTime = formatTime(time);

  const handleTimerAction = useCallback(() => {
    try {
      if (state === "stopped") start();
      else if (state === "running") pause();
      else if (state === "paused") resume();
    } catch (error) {
      handleError(error, "TimeTracker");
    }
  }, [state, start, pause, resume]);

  const handleStop = useCallback(() => {
    const currentTime = time;
    pause();
    setShowSaveDialog(true);
  }, [pause, time]);

  const handleReset = useCallback(() => {
    stop();
    reset();
    resetTimerData();
  }, [stop, reset, resetTimerData]);

  const handleSaveTimeEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      tags: string[];
    }) => {
      stop();
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
    <Card className={cn(styles.card.base, "-mx-4 sm:mx-0")}>
      <CardContent className="p-3 space-y-3">
        {/* Timer Display */}
        <div className={cn(styles.components.timerDisplay)}>
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
                className={cn(styles.components.iconButton)}
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
            <Select value={selectedCustomer} onValueChange={setCustomerId}>
              <SelectTrigger
                id="customer-select"
                className={cn(styles.input.base, styles.input.hover)}
              >
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className={styles.components.selectContent}>
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id}
                    className={styles.components.selectItem}
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
              onValueChange={setProjectId}
              disabled={!selectedCustomer}
            >
              <SelectTrigger
                id="project-select"
                className={cn(styles.input.base, styles.input.hover)}
              >
                <SelectValue
                  placeholder={
                    selectedCustomer
                      ? "Select project"
                      : "Select customer first"
                  }
                />
              </SelectTrigger>
              <SelectContent className={styles.components.selectContent}>
                {projects
                  .filter((project) => project.customer_id === selectedCustomer)
                  .map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className={styles.components.selectItem}
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
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && state === "stopped") {
                handleTimerAction();
              }
            }}
            className={cn(styles.input.base, styles.input.hover)}
          />
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleTimerAction}
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
            onClick={handleStop}
            variant="destructive"
            className={cn(styles.components.stopButton)}
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
        onOpenChange={(open) => {
          setShowSaveDialog(open);
          // Do not automatically resume when dialog is closed
        }}
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
