import React, { useCallback } from "react";
import { useTimerStore } from "@/store/timerStore";
import { useTimeEntryStore } from "@/store/timeEntryStore";
import { useTimerDataStore } from "@/store/timerDataStore";
import { useDialogStore } from "@/store/dialogStore";
import { createTimeEntry } from "@/lib/api/timeEntries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";
import { ValidationError } from "@/config/errors";
import { ERROR_MESSAGES } from "@/config/errors";
import { styles } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Clock,
  Play,
  Pause,
  Square,
  Building2,
  RotateCcw,
  Plus,
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

import { useTimerLogic } from "@/lib/timer/hooks/useTimerLogic";

function TimeTracker({
  projects = [],
  customers = [],
  availableTags = [],
  onTimeEntrySaved,
}: TimeTrackerProps) {
  // Ensure arrays are initialized
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeAvailableTags = Array.isArray(availableTags) ? availableTags : [];
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { saveTimeEntryDialog, setSaveTimeEntryDialog } = useDialogStore();

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
    setSaveTimeEntryDialog(
      true,
      {
        taskName,
        projectId: selectedProject,
        customerId: selectedCustomer,
      },
      false,
    );
  }, [
    timerStop,
    taskName,
    selectedProject,
    selectedCustomer,
    setSaveTimeEntryDialog,
  ]);

  const handleReset = useCallback(() => {
    timerReset();
    resetTimerData();
    toast.info(t("timer.reset"));
  }, [timerReset, resetTimerData, t]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSaveTimeEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      tags: string[];
      duration: number;
      startTime: string;
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
          duration: data.duration,
          start_time: new Date(data.startTime).toISOString(),
          description: data.description || undefined,
        };

        await createTimeEntry(entry);
        toast.success(t("timeEntry.save"), {
          description: `${data.taskName} - ${formatDuration(data.duration)}`,
        });
        onTimeEntrySaved?.();
        timerReset();
        setSaveTimeEntryDialog(false);

        // Only reset form data if it's not a manual entry
        if (!saveTimeEntryDialog.isManualEntry) {
          setTaskName("");
          setProjectId("");
          setCustomerId("");
          resetTimerData();
        } else {
          // Manuel giriş başarılı olduğunda, localStorage'daki verileri temizleme
          // Bir sonraki manuel girişte yeni veriler girilmesi için
          // localStorage.removeItem("timeEntry.manualEntry");
          // Yorum satırı olarak bırakıldı, böylece veriler hatırlanacak
        }
      } catch (error) {
        handleError(error, "TimeTracker");
        setSaveTimeEntryDialog(false);
      }
    },
    [
      onTimeEntrySaved,
      timerReset,
      t,
      saveTimeEntryDialog.isManualEntry,
      setTaskName,
      setProjectId,
      setCustomerId,
      resetTimerData,
      setSaveTimeEntryDialog,
    ],
  );

  return (
    <Card
      className={cn(
        "border-0 sm:border",
        "rounded-none sm:rounded-3xl",
        "animate-in fade-in-50 duration-500",
        "bg-gradient-to-br from-background/95 via-background/90 to-background/80",
        "backdrop-blur-xl",
        "shadow-lg sm:shadow-xl",
        "transition-all duration-500 ease-out-expo",
        "border-primary/20",
        state === "running" &&
          "ring-1 ring-primary/20 shadow-2xl shadow-primary/10 border-primary/20",
      )}
    >
      <CardContent className="p-0 sm:p-3 space-y-2 sm:space-y-3 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.1),transparent_70%)]" />
        <div className="relative z-10">
          {/* Timer Display */}
          <div className="relative overflow-hidden bg-gradient-to-br from-background/80 via-background/50 to-background/30 dark:from-black/80 dark:via-black/60 dark:to-black/40 p-2.5 sm:p-6 transition-all duration-300 group rounded-lg sm:rounded-2xl border-0 sm:border sm:border-border/10 backdrop-blur-md shadow-md sm:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.1),transparent_70%)]" />

            <div className="relative z-10">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-background/80 to-background/60 dark:from-black/50 dark:to-black/30 text-primary ring-1 ring-border/10 shadow-lg overflow-hidden group/icon backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
                    <Clock
                      className={cn(
                        "relative h-5 w-5 transition-all duration-300",
                        state === "running" && "animate-timer-pulse",
                        "text-foreground dark:text-foreground",
                        "group-hover/icon:scale-110",
                      )}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {state === "running"
                      ? t("timer.running")
                      : state === "paused"
                        ? t("timer.paused")
                        : t("timer.stopped")}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono text-3xl sm:text-7xl font-bold tracking-tight text-foreground dark:text-foreground transition-all duration-300 relative">
                    {formattedTime}
                    <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  {time > 0 && (
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg sm:rounded-xl bg-background/80 dark:bg-black/50 hover:bg-accent/80 text-muted-foreground hover:text-foreground transition-all duration-200 ring-1 ring-border/10 hover:ring-border shadow-sm"
                      title={t("timer.reset")}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Project Selection */}
          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2 px-2.5 sm:px-6 mt-3 sm:mt-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium" htmlFor="customer-select">
                {t("timeEntry.customer")}
              </Label>
              <Select value={selectedCustomer} onValueChange={setCustomerId}>
                <SelectTrigger
                  id="customer-select"
                  className={cn(styles.input.base, styles.input.hover)}
                >
                  <SelectValue placeholder={t("timeEntry.selectCustomer")} />
                </SelectTrigger>
                <SelectContent className={styles.components.selectContent}>
                  {safeCustomers.map((customer) => (
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
                {t("timeEntry.project")}
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
                        ? t("timeEntry.selectProject")
                        : t("timeEntry.selectCustomerFirst")
                    }
                  />
                </SelectTrigger>
                <SelectContent className={styles.components.selectContent}>
                  {safeProjects
                    .filter(
                      (project) => project.customer_id === selectedCustomer,
                    )
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
          <div className="space-y-1 px-2.5 sm:px-6 mt-2.5 sm:mt-4">
            <Label className="text-sm font-medium" htmlFor="task-name">
              {t("timeEntry.taskName")}
            </Label>
            <Input
              id="task-name"
              type="text"
              placeholder={t("timeEntry.taskNamePlaceholder")}
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-6 px-2.5 sm:px-6 pb-2.5 sm:pb-6">
            <div className="flex gap-2 flex-1">
              <Button
                onClick={handleTimerAction}
                variant={state === "paused" ? "outline" : "default"}
                className={cn(
                  "flex-1",
                  "h-10 sm:h-12 rounded-lg sm:rounded-xl",
                  state === "paused"
                    ? "bg-gradient-to-tr from-purple-400 to-cyan-700 text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 dark:from-purple-400 dark:to-cyan-700"
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                {(state === "stopped" || !state) && (
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4 animate-pulse" />
                    <span>{t("timer.start")}</span>
                  </div>
                )}
                {state === "running" && (
                  <div className="flex items-center justify-center gap-2">
                    <Pause className="h-4 w-4" />
                    <span>{t("timer.pause")}</span>
                  </div>
                )}
                {state === "paused" && (
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4 animate-pulse" />
                    <span>{t("timer.resume")}</span>
                  </div>
                )}
              </Button>

              {state !== "stopped" && (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className={cn(styles.components.stopButton)}
                  size="icon"
                  title={t("timer.stop")}
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              onClick={() => {
                setSaveTimeEntryDialog(
                  true,
                  {
                    taskName: taskName,
                    projectId: selectedProject,
                    customerId: selectedCustomer,
                  },
                  true,
                );
              }}
              variant="outline"
              className="w-full sm:w-auto h-10 sm:h-12 bg-background/50 hover:bg-accent/50 text-foreground border-border"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manuel Giriş
            </Button>
          </div>
        </div>
      </CardContent>

      <SaveTimeEntryDialog
        open={saveTimeEntryDialog.isOpen}
        onOpenChange={(open) => {
          setSaveTimeEntryDialog(
            open,
            undefined,
            saveTimeEntryDialog.isManualEntry,
          );
        }}
        taskName={saveTimeEntryDialog.taskName}
        projectId={saveTimeEntryDialog.projectId}
        customerId={saveTimeEntryDialog.customerId}
        projects={safeProjects}
        customers={safeCustomers}
        availableTags={safeAvailableTags}
        duration={saveTimeEntryDialog.isManualEntry ? 0 : time}
        onSave={handleSaveTimeEntry}
      />
    </Card>
  );
}

export default TimeTracker;
