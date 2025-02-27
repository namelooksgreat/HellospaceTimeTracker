import React, { useState, useEffect } from "react";
import { useTimeEntryStore } from "@/store/timeEntryStore";
import { Building2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDialogStore } from "@/store/dialogStore";

interface SaveTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  projectId: string;
  customerId: string;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers: Array<{ id: string; name: string }>;
  availableTags: Array<{ value: string; label: string }>;
  duration: number;
  onSave: (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
    duration: number;
    startTime: string;
  }) => void;
}

export function SaveTimeEntryDialog({
  open,
  onOpenChange,
  taskName: initialTaskName,
  projectId: initialProjectId,
  customerId: initialCustomerId,
  projects,
  customers,
  duration: initialDuration,
  onSave,
}: SaveTimeEntryDialogProps) {
  const initialRender = React.useRef(true);
  const { saveTimeEntryDialog } = useDialogStore();

  useEffect(() => {
    if (open && initialRender.current) {
      requestAnimationFrame(() => {
        const activeElement = document.activeElement as HTMLElement;
        activeElement?.blur?.();
        initialRender.current = false;
      });
    }
  }, [open]);

  const [formData, setFormData] = useState<{
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
    startTime: string;
  }>({
    taskName: initialTaskName || "",
    projectId: initialProjectId || "",
    customerId: initialCustomerId || "",
    description: "",
    tags: [],
    startTime: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    })(),
  });

  const { duration, setDuration } = useTimeEntryStore();

  useEffect(() => {
    if (open) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      const savedDescription =
        localStorage.getItem("timeEntry.lastDescription") || "";

      // Manuel giriş için kaydedilmiş verileri al
      const savedManualEntry = localStorage.getItem("timeEntry.manualEntry");
      const savedData = savedManualEntry ? JSON.parse(savedManualEntry) : null;

      if (saveTimeEntryDialog.isManualEntry) {
        if (savedData) {
          // Kaydedilmiş manuel giriş verilerini kullan
          setFormData({
            taskName: savedData.taskName || "",
            projectId: savedData.projectId || "",
            customerId: savedData.customerId || "",
            description: savedData.description || savedDescription,
            tags: savedData.tags || [],
            startTime: formattedDateTime, // Tarih her zaman güncel olsun
          });
          setDuration(savedData.duration || 0);
        } else {
          setFormData({
            taskName: "",
            projectId: "",
            customerId: "",
            description: savedDescription,
            tags: [],
            startTime: formattedDateTime,
          });
          setDuration(0);
        }
      } else {
        setFormData({
          taskName: initialTaskName || "",
          projectId: initialProjectId || "",
          customerId: initialCustomerId || "",
          description: savedDescription,
          tags: [],
          startTime: formattedDateTime,
        });
        setDuration(initialDuration);
      }
    }
  }, [
    open,
    initialTaskName,
    initialProjectId,
    initialCustomerId,
    initialDuration,
    setDuration,
    saveTimeEntryDialog.isManualEntry,
  ]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleSave = () => {
    const validDuration = Math.max(0, duration);
    const saveData = {
      ...formData,
      duration: validDuration,
      startTime: formData.startTime,
    };

    console.debug("Saving time entry:", saveData);

    // Manuel giriş verilerini localStorage'a kaydet
    if (saveTimeEntryDialog.isManualEntry) {
      localStorage.setItem("timeEntry.manualEntry", JSON.stringify(saveData));
    }

    onSave(saveData);
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  const DialogComponent = isMobile ? Sheet : Dialog;
  const ContentComponent = isMobile ? SheetContent : DialogContent;
  const HeaderComponent = isMobile ? SheetHeader : DialogHeader;
  const TitleComponent = isMobile ? SheetTitle : DialogTitle;

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      <ContentComponent
        className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <HeaderComponent className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <TitleComponent className="text-lg font-semibold tracking-tight">
              Save Time Entry
            </TitleComponent>
          </div>

          <div className="mt-6">
            <div className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground font-medium">
                    Total Duration
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {formatDuration(duration)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={Math.floor(duration / 3600)}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0;
                        const minutes = Math.floor((duration % 3600) / 60);
                        const seconds = duration % 60;
                        const newDuration =
                          hours * 3600 + minutes * 60 + seconds;
                        setDuration(newDuration);
                      }}
                      className="h-16 w-full text-center font-mono text-3xl font-bold bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      h
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={Math.floor((duration % 3600) / 60)}
                      onChange={(e) => {
                        const hours = Math.floor(duration / 3600);
                        const minutes = parseInt(e.target.value) || 0;
                        const seconds = duration % 60;
                        const newDuration =
                          hours * 3600 + minutes * 60 + seconds;
                        setDuration(newDuration);
                      }}
                      className="h-16 w-full text-center font-mono text-3xl font-bold bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      m
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={duration % 60}
                      onChange={(e) => {
                        const hours = Math.floor(duration / 3600);
                        const minutes = Math.floor((duration % 3600) / 60);
                        const seconds = parseInt(e.target.value) || 0;
                        const newDuration =
                          hours * 3600 + minutes * 60 + seconds;
                        setDuration(newDuration);
                      }}
                      className="h-16 w-full text-center font-mono text-3xl font-bold bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      s
                    </span>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Started at
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <DateTimePicker
                      date={new Date(formData.startTime)}
                      setDate={(date) => {
                        const currentDate = new Date(formData.startTime);
                        date.setHours(currentDate.getHours());
                        date.setMinutes(currentDate.getMinutes());
                        setFormData((prev) => ({
                          ...prev,
                          startTime: date.toISOString(),
                        }));
                      }}
                    />
                    <Input
                      type="time"
                      value={format(new Date(formData.startTime), "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value
                          .split(":")
                          .map(Number);
                        const date = new Date(formData.startTime);
                        date.setHours(hours);
                        date.setMinutes(minutes);
                        setFormData((prev) => ({
                          ...prev,
                          startTime: date.toISOString(),
                        }));
                      }}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeaderComponent>

        <ScrollArea className="max-h-[calc(100vh-20rem)] sm:max-h-[calc(100vh-22rem)] overflow-y-auto overscroll-none bg-gradient-to-b from-transparent via-background/50 to-background/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input
                value={formData.taskName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, taskName: e.target.value }))
                }
                placeholder="What did you work on?"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerId: value,
                      projectId: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
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
                <Label>Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, projectId: value }))
                  }
                  disabled={!formData.customerId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.customerId
                          ? "Select project"
                          : "Select customer first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter(
                        (project) =>
                          project.customer_id === formData.customerId,
                      )
                      .map((project) => (
                        <SelectItem key={project.id} value={project.id}>
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

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => {
                  const newDescription = e.target.value;
                  localStorage.setItem(
                    "timeEntry.lastDescription",
                    newDescription,
                  );
                  setFormData((prev) => ({
                    ...prev,
                    description: newDescription,
                  }));
                }}
                placeholder="Add any additional notes..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 z-50">
          <div className="flex gap-3 max-w-xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 flex-1 rounded-xl border-border/50 hover:bg-accent/50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-12 flex-1 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Save
            </Button>
          </div>
        </div>
      </ContentComponent>
    </DialogComponent>
  );
}
