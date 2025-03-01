import { useState, useEffect, useRef } from "react";
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
import { TagSelector } from "./TagSelector";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDialogStore } from "@/store/dialogStore";
import { supabase } from "@/lib/supabase";
import { lightHapticFeedback } from "@/lib/utils/haptics";

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
  availableTags = [],
  duration: initialDuration,
  onSave,
}: SaveTimeEntryDialogProps) {
  const initialRender = useRef(true);
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

      if (saveTimeEntryDialog.isManualEntry) {
        // Kaydedilmiş etiketleri al
        const savedTagsStr = localStorage.getItem("timeEntry.savedTags");
        const savedTags = savedTagsStr ? JSON.parse(savedTagsStr) : [];

        // Seçili etiketleri hatırla
        const selectedTagsStr = localStorage.getItem("timeEntry.selectedTags");
        const selectedTags = selectedTagsStr ? JSON.parse(selectedTagsStr) : [];

        // Manuel giriş için her zaman boş form göster ama etiketleri koru
        setFormData({
          taskName: "",
          projectId: "",
          customerId: "",
          description: "", // Description alanını da sıfırla
          tags: selectedTags.length > 0 ? selectedTags : savedTags,
          startTime: formattedDateTime,
        });
        setDuration(0);
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
    try {
      const validDuration = Math.max(0, duration);
      const saveData = {
        ...formData,
        duration: validDuration,
        startTime: formData.startTime,
      };

      // Use secure logging
      import("@/lib/utils/secure-logging").then(({ secureLogger }) => {
        secureLogger.debug("Saving time entry");
      });

      // Manuel giriş verilerini localStorage'a kaydet
      if (saveTimeEntryDialog.isManualEntry) {
        // Etiketleri tut ama form kaydedildiğinde diğer verileri temizle
        const savedTags = formData.tags;
        localStorage.removeItem("timeEntry.manualEntry");
        localStorage.setItem("timeEntry.savedTags", JSON.stringify(savedTags));
      }

      // Her durumda description alanını sıfırla
      localStorage.setItem("timeEntry.lastDescription", "");

      // Etiketleri temizleme
      localStorage.removeItem("timeEntry.selectedTags");

      onSave(saveData);
    } catch (error) {
      console.error("Error saving time entry:", error);
    }
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[90vh] p-0 gap-0 overflow-hidden rounded-t-xl"
        >
          <SheetHeader className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <SheetTitle className="text-lg font-semibold tracking-tight">
                Save Time Entry
              </SheetTitle>
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

                          // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                          if (saveTimeEntryDialog.isManualEntry) {
                            const currentData = {
                              ...formData,
                              duration: newDuration,
                            };
                            localStorage.setItem(
                              "timeEntry.manualEntry",
                              JSON.stringify(currentData),
                            );
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
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

                          // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                          if (saveTimeEntryDialog.isManualEntry) {
                            const currentData = {
                              ...formData,
                              duration: newDuration,
                            };
                            localStorage.setItem(
                              "timeEntry.manualEntry",
                              JSON.stringify(currentData),
                            );
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
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

                          // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                          if (saveTimeEntryDialog.isManualEntry) {
                            const currentData = {
                              ...formData,
                              duration: newDuration,
                            };
                            localStorage.setItem(
                              "timeEntry.manualEntry",
                              JSON.stringify(currentData),
                            );
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
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
          </SheetHeader>

          <ScrollArea className="h-[calc(90vh-22rem)] overflow-y-auto overscroll-none bg-gradient-to-b from-transparent via-background/50 to-background/50 backdrop-blur-sm">
            <div className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label>Task Name</Label>
                <Input
                  value={formData.taskName}
                  onChange={(e) => {
                    const newTaskName = e.target.value;
                    setFormData((prev) => ({ ...prev, taskName: newTaskName }));

                    // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                    if (saveTimeEntryDialog.isManualEntry) {
                      const currentData = {
                        ...formData,
                        taskName: newTaskName,
                        duration: duration,
                      };
                      localStorage.setItem(
                        "timeEntry.manualEntry",
                        JSON.stringify(currentData),
                      );
                    }
                  }}
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => {
                      lightHapticFeedback();
                      setFormData((prev) => ({
                        ...prev,
                        customerId: value,
                        projectId: "",
                      }));

                      // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                      if (saveTimeEntryDialog.isManualEntry) {
                        const currentData = {
                          ...formData,
                          customerId: value,
                          projectId: "",
                          duration: duration,
                        };
                        localStorage.setItem(
                          "timeEntry.manualEntry",
                          JSON.stringify(currentData),
                        );
                      }
                    }}
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
                    onValueChange={(value) => {
                      lightHapticFeedback();
                      setFormData((prev) => ({ ...prev, projectId: value }));

                      // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                      if (saveTimeEntryDialog.isManualEntry) {
                        const currentData = {
                          ...formData,
                          projectId: value,
                          duration: duration,
                        };
                        localStorage.setItem(
                          "timeEntry.manualEntry",
                          JSON.stringify(currentData),
                        );
                      }
                    }}
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

                  {formData.projectId && (
                    <TagSelector
                      projectId={formData.projectId}
                      selectedTags={formData.tags}
                      onTagsChange={(tags) => {
                        setFormData((prev) => ({ ...prev, tags }));

                        // Seçili etiketleri localStorage'a kaydet
                        localStorage.setItem(
                          "timeEntry.selectedTags",
                          JSON.stringify(tags),
                        );

                        // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                        if (saveTimeEntryDialog.isManualEntry) {
                          const currentData = {
                            ...formData,
                            tags,
                            duration: duration,
                          };
                          localStorage.setItem(
                            "timeEntry.manualEntry",
                            JSON.stringify(currentData),
                          );
                        }
                      }}
                      className="mt-2"
                    />
                  )}
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

                    // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                    if (saveTimeEntryDialog.isManualEntry) {
                      const currentData = {
                        ...formData,
                        description: newDescription,
                        duration: duration,
                      };
                      localStorage.setItem(
                        "timeEntry.manualEntry",
                        JSON.stringify(currentData),
                      );
                    }
                  }}
                  placeholder="Add any additional notes..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-lg border-border/50 hover:bg-accent/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all duration-200"
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full p-0 gap-0 overflow-hidden rounded-xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10">
        <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Save Time Entry
            </DialogTitle>
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

                        // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                        if (saveTimeEntryDialog.isManualEntry) {
                          const currentData = {
                            ...formData,
                            duration: newDuration,
                          };
                          localStorage.setItem(
                            "timeEntry.manualEntry",
                            JSON.stringify(currentData),
                          );
                        }
                      }}
                      onClick={(e) => e.currentTarget.select()}
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

                        // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                        if (saveTimeEntryDialog.isManualEntry) {
                          const currentData = {
                            ...formData,
                            duration: newDuration,
                          };
                          localStorage.setItem(
                            "timeEntry.manualEntry",
                            JSON.stringify(currentData),
                          );
                        }
                      }}
                      onClick={(e) => e.currentTarget.select()}
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

                        // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                        if (saveTimeEntryDialog.isManualEntry) {
                          const currentData = {
                            ...formData,
                            duration: newDuration,
                          };
                          localStorage.setItem(
                            "timeEntry.manualEntry",
                            JSON.stringify(currentData),
                          );
                        }
                      }}
                      onClick={(e) => e.currentTarget.select()}
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
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-22rem)] overflow-y-auto overscroll-none bg-gradient-to-b from-transparent via-background/50 to-background/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input
                value={formData.taskName}
                onChange={(e) => {
                  const newTaskName = e.target.value;
                  setFormData((prev) => ({ ...prev, taskName: newTaskName }));

                  // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                  if (saveTimeEntryDialog.isManualEntry) {
                    const currentData = {
                      ...formData,
                      taskName: newTaskName,
                      duration: duration,
                    };
                    localStorage.setItem(
                      "timeEntry.manualEntry",
                      JSON.stringify(currentData),
                    );
                  }
                }}
                placeholder="What did you work on?"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      customerId: value,
                      projectId: "",
                    }));

                    // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                    if (saveTimeEntryDialog.isManualEntry) {
                      const currentData = {
                        ...formData,
                        customerId: value,
                        projectId: "",
                        duration: duration,
                      };
                      localStorage.setItem(
                        "timeEntry.manualEntry",
                        JSON.stringify(currentData),
                      );
                    }
                  }}
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
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, projectId: value }));

                    // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                    if (saveTimeEntryDialog.isManualEntry) {
                      const currentData = {
                        ...formData,
                        projectId: value,
                        duration: duration,
                      };
                      localStorage.setItem(
                        "timeEntry.manualEntry",
                        JSON.stringify(currentData),
                      );
                    }
                  }}
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

                {formData.projectId && (
                  <TagSelector
                    projectId={formData.projectId}
                    selectedTags={formData.tags}
                    onTagsChange={(tags) => {
                      setFormData((prev) => ({ ...prev, tags }));

                      // Seçili etiketleri localStorage'a kaydet
                      localStorage.setItem(
                        "timeEntry.selectedTags",
                        JSON.stringify(tags),
                      );

                      // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                      if (saveTimeEntryDialog.isManualEntry) {
                        const currentData = {
                          ...formData,
                          tags,
                          duration: duration,
                        };
                        localStorage.setItem(
                          "timeEntry.manualEntry",
                          JSON.stringify(currentData),
                        );
                      }
                    }}
                    className="mt-2"
                  />
                )}
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

                  // Manuel giriş modunda ise, değişiklikleri anında localStorage'a kaydet
                  if (saveTimeEntryDialog.isManualEntry) {
                    const currentData = {
                      ...formData,
                      description: newDescription,
                      duration: duration,
                    };
                    localStorage.setItem(
                      "timeEntry.manualEntry",
                      JSON.stringify(currentData),
                    );
                  }
                }}
                placeholder="Add any additional notes..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-lg border-border/50 hover:bg-accent/50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all duration-200"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
