import React, { useState, useEffect } from "react";
import { createTimeEntry, updateTimeEntry } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
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
  editingEntry?: any;
  showEditDialog?: boolean;
  onEditDialogClose?: () => void;
  onEditComplete?: () => void;
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

type TimerState = "stopped" | "running" | "paused" | "break";
type TimerMode = "list" | "pomodoro";
type PomodoroMode = "classic" | "long" | "short";

const TimeTracker = ({
  onStart = () => {},
  onStop = () => {},
  onReset = () => {},
  initialTaskName = "",
  projects = [],
  customers = [
    { id: "1", name: "Customer 1" },
    { id: "2", name: "Customer 2" },
    { id: "3", name: "Customer 3" },
  ],
  availableTags = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "documentation", label: "Documentation" },
    { value: "design", label: "Design" },
    { value: "testing", label: "Testing" },
  ],
  editingEntry,
  showEditDialog = false,
  onEditDialogClose = () => {},
  onEditComplete = () => {},
}: TimeTrackerProps) => {
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [timerMode, setTimerMode] = useState<TimerMode>("list");
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>("classic");
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [time, setTime] = useState(0);
  const [taskName, setTaskName] = useState(
    localStorage.getItem("lastTaskName") || initialTaskName,
  );
  const [selectedCustomer, setSelectedCustomer] = useState(
    localStorage.getItem("selectedCustomerId") || customers[0]?.id || "",
  );
  const [selectedProject, setSelectedProject] = useState(
    localStorage.getItem("selectedProjectId") || "",
  );

  // Filter projects based on selected customer
  const customerProjects = projects.filter(
    (project) => project.customer_id === selectedCustomer,
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    let startTime: number;

    if (timerState === "running") {
      startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTime((prevTime) => prevTime + elapsed);
        startTime = Date.now();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")} : ${minutes
      .toString()
      .padStart(2, "0")} : ${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPomodoroTime = () => {
    switch (pomodoroMode) {
      case "classic":
        return isBreakTime ? 5 * 60 : 25 * 60;
      case "long":
        return isBreakTime ? 10 * 60 : 50 * 60;
      case "short":
        return isBreakTime ? 3 * 60 : 15 * 60;
    }
  };

  const handleTimerAction = () => {
    if (timerMode === "pomodoro") {
      const targetTime = getPomodoroTime();
      if (time >= targetTime) {
        setIsBreakTime(!isBreakTime);
        setTime(0);
        return;
      }
    }
    switch (timerState) {
      case "stopped":
        setTimerState("running");
        onStart();
        break;
      case "running":
        setTimerState("paused");
        break;
      case "paused":
        setTimerState("running");
        break;
    }
  };

  const handleStop = () => {
    setTimerState("stopped");
    setShowSaveDialog(true);
  };

  const handleSaveTimeEntry = async (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }) => {
    try {
      await createTimeEntry(
        {
          task_name: data.taskName,
          description: data.description,
          duration: time,
          start_time: new Date(Date.now() - time * 1000).toISOString(),
          project_id: data.projectId,
        },
        data.tags,
      );

      onStop();
      setTaskName("");
      localStorage.removeItem("lastTaskName");
      localStorage.removeItem("lastDescription");
      localStorage.removeItem("selectedProjectId");
      localStorage.removeItem("selectedCustomerId");
      setTime(0);
      setTimerState("stopped");
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving time entry:", error);
    }
  };

  return (
    <Card className="w-full bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Time Tracker</h2>
        </div>

        <Tabs
          value={timerMode}
          onValueChange={(v) => setTimerMode(v as TimerMode)}
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
          <div className="space-y-3">
            <Select
              value={selectedCustomer}
              onValueChange={(value) => {
                setSelectedCustomer(value);
                setSelectedProject("");
                localStorage.setItem("selectedCustomerId", value);
                localStorage.removeItem("selectedProjectId");
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
                localStorage.setItem("selectedProjectId", value);
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
              localStorage.setItem("lastTaskName", e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && timerState === "stopped") {
                handleTimerAction();
              }
            }}
            className="w-full h-12 bg-muted/50 border-input/50 focus-visible:ring-primary/20"
          />

          <div className="space-y-4">
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
            <div className="text-center space-y-1">
              <div className="font-mono text-4xl font-bold tracking-wider text-primary">
                {formatTime(time)}
              </div>
              {timerMode === "pomodoro" && timerState !== "stopped" && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {isBreakTime ? (
                    <>
                      <Coffee className="h-4 w-4" />
                      Break Time
                    </>
                  ) : (
                    <>
                      <Timer className="h-4 w-4" />
                      Focus Time
                    </>
                  )}
                  <span>•</span>
                  {formatTime(getPomodoroTime() - time)} remaining
                </div>
              )}
            </div>
          </div>
        </div>

        <SaveTimeEntryDialog
          open={showSaveDialog || showEditDialog}
          onOpenChange={(open) => {
            if (showEditDialog) {
              onEditDialogClose();
            } else {
              setShowSaveDialog(open);
              if (!open) {
                setTimerState("paused");
              }
            }
          }}
          taskName={editingEntry ? editingEntry.task_name : taskName}
          projectId={editingEntry ? editingEntry.project_id : selectedProject}
          customerId={
            editingEntry ? editingEntry.project?.customer_id : selectedCustomer
          }
          projects={projects}
          customers={customers}
          availableTags={availableTags}
          duration={editingEntry ? editingEntry.duration : time}
          onSave={async (data) => {
            if (editingEntry) {
              try {
                await updateTimeEntry(
                  editingEntry.id,
                  {
                    task_name: data.taskName,
                    description: data.description,
                    project_id: data.projectId,
                  },
                  data.tags,
                );
                onEditComplete();
              } catch (error) {
                console.error("Error updating time entry:", error);
              }
            } else {
              handleSaveTimeEntry(data);
            }
          }}
          isEditing={!!editingEntry}
        />
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
