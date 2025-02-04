import React, { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { useTimer } from "@/hooks/useTimer";
import { createTimeEntry } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { showSuccess } from "@/lib/utils/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Timer, Play, Pause, Square, Coffee } from "lucide-react";
import { PomodoroSettings } from "./PomodoroSettings";

interface TimeTrackerProps {
  onTimeEntrySaved?: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  initialTaskName?: string;
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers?: Array<{ id: string; name: string }>;
  availableTags?: Array<{ value: string; label: string }>;
}

const TimeTracker = ({
  onStart = () => {},
  onStop = () => {},
  onReset = () => {},
  initialTaskName = "",
  projects = [],
  customers = [],
  availableTags = [],
  onTimeEntrySaved = () => {},
}: TimeTrackerProps) => {
  const {
    timerState,
    timerMode,
    pomodoroMode,
    isBreakTime,
    time,
    formattedTime,
    setTimerMode,
    setPomodoroMode,
    start,
    pause,
    resume,
    stop,
    reset,
    getPomodoroTime,
  } = useTimer({
    onStart,
    onStop,
    onReset,
  });
  const [taskName, setTaskName] = useState(initialTaskName);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load saved state when component mounts
  useEffect(() => {
    const savedTaskName = localStorage.getItem(STORAGE_KEYS.LAST_TASK_NAME);
    if (savedTaskName) setTaskName(savedTaskName);

    if (customers.length > 0) {
      const savedCustomerId = localStorage.getItem(
        STORAGE_KEYS.SELECTED_CUSTOMER_ID,
      );
      const validCustomer = customers.find((c) => c.id === savedCustomerId);

      if (validCustomer) {
        setSelectedCustomer(validCustomer.id);

        const savedProjectId = localStorage.getItem(
          STORAGE_KEYS.SELECTED_PROJECT_ID,
        );
        const validProject = projects.find(
          (p) => p.id === savedProjectId && p.customer_id === validCustomer.id,
        );

        if (validProject) {
          setSelectedProject(validProject.id);
        }
      } else {
        // If no valid customer, set to first customer
        setSelectedCustomer(customers[0].id);
        localStorage.setItem(
          STORAGE_KEYS.SELECTED_CUSTOMER_ID,
          customers[0].id,
        );
      }
    }
  }, [customers, projects, initialTaskName]);

  // Persist state changes to localStorage
  useEffect(() => {
    if (selectedCustomer)
      localStorage.setItem(STORAGE_KEYS.SELECTED_CUSTOMER_ID, selectedCustomer);
    if (selectedProject)
      localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, selectedProject);
    if (taskName) localStorage.setItem(STORAGE_KEYS.LAST_TASK_NAME, taskName);
  }, [selectedCustomer, selectedProject, taskName]);

  // Filter projects based on selected customer
  const customerProjects = projects.filter(
    (project) => project.customer_id === selectedCustomer,
  );

  const handleTimerAction = useCallback(() => {
    if (timerState === "stopped") {
      start();
    } else if (timerState === "running") {
      pause();
    } else if (timerState === "paused") {
      resume();
    }
  }, [timerState, start, pause, resume]);

  const handleStop = useCallback(() => {
    if (time > 0) {
      stop();
      setShowSaveDialog(true);
    }
  }, [time, stop]);

  const handleSaveTimeEntry = async (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }) => {
    try {
      const currentTime = time;
      setShowSaveDialog(false);

      await createTimeEntry(
        {
          task_name: data.taskName,
          description: data.description,
          duration: currentTime,
          start_time: new Date(Date.now() - currentTime * 1000).toISOString(),
          project_id: data.projectId,
        },
        data.tags,
      );

      // Reset timer state
      onStop();
      reset();
      setTaskName("");
      localStorage.removeItem(STORAGE_KEYS.LAST_TASK_NAME);
      localStorage.removeItem(STORAGE_KEYS.LAST_DESCRIPTION);

      // Show success message
      showSuccess("Time entry saved successfully");

      // Notify parent to refresh time entries
      onTimeEntrySaved();
    } catch (error) {
      console.error("Error saving time entry:", error);
      setShowSaveDialog(true);
      throw error;
    }
  };

  return (
    <Card className="w-full bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden sm:rounded-lg rounded-none border-x-0 sm:border-x">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Time Tracker</h2>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold tracking-wider text-primary">
              {formattedTime}
            </div>
            {timerMode === "pomodoro" && timerState !== "stopped" && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
                {isBreakTime ? (
                  <>
                    <Coffee className="h-3 w-3" />
                    Break Time
                  </>
                ) : (
                  <>
                    <Timer className="h-3 w-3" />
                    Focus Time
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <Tabs
          value={timerMode}
          onValueChange={(v) => setTimerMode(v as "list" | "pomodoro")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="list"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              List
            </TabsTrigger>
            <TabsTrigger
              value="pomodoro"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Pomodoro
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {timerMode === "pomodoro" && (
          <PomodoroSettings
            mode={pomodoroMode}
            onModeChange={setPomodoroMode}
          />
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={selectedCustomer}
              onValueChange={(value) => {
                setSelectedCustomer(value);
                setSelectedProject("");
                localStorage.setItem(STORAGE_KEYS.SELECTED_CUSTOMER_ID, value);
                localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
              }}
            >
              <SelectTrigger className="h-12 bg-muted/50 border-input/50">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="select-content" position="item-aligned">
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id}
                    className="select-item"
                  >
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
                localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, value);
              }}
              disabled={!selectedCustomer}
            >
              <SelectTrigger className="h-12 bg-muted/50 border-input/50">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="select-content" position="item-aligned">
                {customerProjects.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={project.id}
                    className="py-3 cursor-pointer focus:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => {
              setTaskName(e.target.value);
              localStorage.setItem(STORAGE_KEYS.LAST_TASK_NAME, e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && timerState === "stopped") {
                handleTimerAction();
              }
            }}
            className="w-full h-12 bg-muted/50 border-input/50 focus-visible:ring-primary/20"
          />

          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={handleTimerAction}
              variant={timerState === "paused" ? "secondary" : "default"}
              className="col-span-3 h-14 text-lg font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              {timerState === "stopped" && (
                <>
                  <Play className="h-5 w-5" />
                  Start
                </>
              )}
              {timerState === "running" && (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              )}
              {timerState === "paused" && (
                <>
                  <Play className="h-5 w-5" />
                  Resume
                </>
              )}
            </Button>
            {timerState !== "stopped" && (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="h-14 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Square className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <SaveTimeEntryDialog
          open={showSaveDialog}
          onOpenChange={(open) => {
            setShowSaveDialog(open);
            if (!open) {
              pause();
            }
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
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
