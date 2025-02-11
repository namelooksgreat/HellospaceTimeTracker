import React, { useCallback } from "react";
import { useTimerStore } from "@/store/timerStore";
import { useTimeEntryStore } from "@/store/timeEntryStore";
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
import { Clock, Play, Pause, Square, Building2, RotateCcw } from "lucide-react";

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

import { useTimerLogic } from "@/lib/timer/hooks/useTimerLogic";

function TimeTracker({
  projects = [],
  customers = [],
  availableTags = [],
  onTimeEntrySaved,
}: TimeTrackerProps) {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);

  const {
    state,
    time,
    formattedTime,
    handleTimerAction: timerAction,
    handleStop: timerStop,
    handleReset: timerReset,
  } = useTimerLogic();

  const {
    taskName,
    projectId: selectedProject,
    customerId: selectedCustomer,
    setTaskName,
    setProjectId,
    setCustomerId,
    reset: resetTimerData,
  } = useTimerDataStore();

  const { setDuration } = useTimeEntryStore();

  const handleTimerAction = useCallback(() => {
    try {
      timerAction();
    } catch (error) {
      handleError(error, "TimeTracker");
    }
  }, [timerAction]);

  const handleStop = useCallback(() => {
    timerStop();
    setShowSaveDialog(true);
  }, [timerStop]);

  const handleReset = useCallback(() => {
    timerReset();
    resetTimerData();
  }, [timerReset, resetTimerData]);

  const handleSaveTimeEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      tags: string[];
      duration: number;
    }) => {
      try {
        console.debug("TimeTracker - Saving time entry with data:", data);

        if (!data.taskName.trim()) {
          throw new ValidationError(ERROR_MESSAGES.TIME_TRACKING.INVALID_TASK, {
            componentName: "TimeTracker",
            action: "save_entry",
          });
        }

        const entry = {
          task_name: data.taskName,
          project_id: data.projectId || null,
          duration: data.duration,
          start_time: new Date().toISOString(),
          description: data.description || undefined,
        };

        console.debug("TimeTracker - Creating entry:", entry);

        await createTimeEntry(entry);
        showSuccess("Time entry saved successfully");
        onTimeEntrySaved?.();
        timerReset();
        setShowSaveDialog(false);
      } catch (error) {
        console.error("TimeTracker - Error saving entry:", error);
        handleError(error, "TimeTracker");
        setShowSaveDialog(false);
      }
    },
    [onTimeEntrySaved, timerReset],
  );

  return (
    <Card className={cn(styles.card.base, "-mx-4 sm:mx-0")}>
      <CardContent className="p-3 space-y-3">
        {/* Timer Display */}
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
                <div className="text-sm font-medium text-muted-foreground">
                  {state === "running"
                    ? "Timer Running"
                    : state === "paused"
                      ? "Timer Paused"
                      : "Timer Stopped"}
                </div>
              </div>
              {time > 0 && (
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-background/80 hover:bg-accent/80 text-muted-foreground hover:text-foreground transition-all duration-200 ring-1 ring-border/50 hover:ring-border shadow-sm"
                  title="Reset timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary relative">
                {formattedTime}
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
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

export default TimeTracker;
