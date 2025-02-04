import React, { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { useTimer } from "@/hooks/useTimer";
import { createTimeEntry } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { showSuccess } from "@/lib/utils/toast";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Timer,
  Play,
  Pause,
  Square,
  Building2,
  FolderKanban,
  RotateCcw,
} from "lucide-react";

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

const TimeTracker = ({
  projects = [],
  customers = [],
  availableTags = [],
  onTimeEntrySaved,
}: TimeTrackerProps) => {
  const [taskName, setTaskName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { timerState, time, formattedTime, start, pause, resume, stop, reset } =
    useTimer();

  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

  const handleTimerAction = () => {
    if (timerState === "stopped") start();
    else if (timerState === "running") pause();
    else if (timerState === "paused") resume();
  };

  const handleStop = () => {
    stop();
    setShowSaveDialog(true);
  };

  const handleReset = () => {
    // First stop the timer
    stop();
    // Then reset it
    reset();
    // Clear all storage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Reset all state
    setTaskName("");
    setSelectedProject("");
    setSelectedCustomer("");
  };

  const handleSaveTimeEntry = async (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }) => {
    try {
      await createTimeEntry({
        task_name: data.taskName,
        project_id: data.projectId,
        duration: time,
        start_time: new Date().toISOString(),
      });
      showSuccess("Time entry saved successfully");
      onTimeEntrySaved?.();
      handleReset();
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving time entry:", error);
    }
  };

  return (
    <Card className="w-full bg-card/95 dark:bg-card/90 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Timer Card */}
          <div className="flex-1 bg-card/50 dark:bg-card/30 border border-border/50 rounded-2xl p-6 shadow-sm order-2 sm:order-1 transition-all duration-300 ease-in-out hover:bg-card/70 dark:hover:bg-card/40">
            <div className="space-y-4">
              {/* Timer Header */}
              <div className="flex items-center gap-2 text-primary">
                <Timer className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Timer
                </CardTitle>
              </div>

              {/* Timer Display */}
              <div className="relative bg-background/50 dark:bg-background/25 rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
                      {formattedTime}
                    </div>
                    {time > 0 && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-muted/50 shrink-0 border-border/50"
                        title="Reset timer"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Project Info */}
            {(selectedCustomerData || selectedProjectData) && (
              <div className="sm:hidden flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
                {selectedCustomerData && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-sm">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedCustomerData.name}</span>
                  </div>
                )}
                {selectedProjectData && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-sm">
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: selectedProjectData.color }}
                    />
                    <span>{selectedProjectData.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer-select">Customer</Label>
              <Select
                value={selectedCustomer}
                onValueChange={(value) => {
                  setSelectedCustomer(value);
                  setSelectedProject("");
                  localStorage.setItem(
                    STORAGE_KEYS.SELECTED_CUSTOMER_ID,
                    value,
                  );
                }}
              >
                <SelectTrigger id="customer-select" className="h-12">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.id}
                      className="py-3"
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

            <div className="space-y-2">
              <Label htmlFor="project-select">Project</Label>
              <Select
                value={selectedProject}
                onValueChange={(value) => {
                  setSelectedProject(value);
                  localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, value);
                }}
                disabled={!selectedCustomer}
              >
                <SelectTrigger id="project-select" className="h-12">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    .filter(
                      (project) => project.customer_id === selectedCustomer,
                    )
                    .map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="py-3"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
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

          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
                localStorage.setItem(
                  STORAGE_KEYS.LAST_TASK_NAME,
                  e.target.value,
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && timerState === "stopped") {
                  handleTimerAction();
                }
              }}
              className="h-12"
            />
          </div>
        </div>
      </CardContent>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 dark:bg-background/90 backdrop-blur-xl border-t border-border/50 transition-colors duration-300 mt-6">
        <div className="flex gap-2">
          <Button
            onClick={handleTimerAction}
            variant={timerState === "paused" ? "secondary" : "default"}
            className="flex-1 h-14 sm:h-14 font-medium flex items-center justify-center gap-2.5 rounded-2xl text-base shadow-lg transition-all duration-300 ease-in-out active:scale-[0.98] hover:shadow-xl"
            size="lg"
          >
            {timerState === "stopped" && (
              <>
                <Play className="h-5 w-5" />
                Start Timer
              </>
            )}
            {timerState === "running" && (
              <>
                <Pause className="h-5 w-5" />
                Pause Timer
              </>
            )}
            {timerState === "paused" && (
              <>
                <Play className="h-5 w-5" />
                Resume Timer
              </>
            )}
          </Button>

          {timerState !== "stopped" && (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="h-12 sm:h-14 w-12 sm:w-14 rounded-xl"
              size="icon"
              title="Stop and save timer"
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
    </Card>
  );
};

export default TimeTracker;
