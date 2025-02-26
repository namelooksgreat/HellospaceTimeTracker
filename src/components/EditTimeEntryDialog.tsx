import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { useTimeEntryStore } from "@/store/timeEntryStore";
import { useDialogStore } from "@/store/dialogStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
} from "@/components/ui/mobile-dialog";
import { TimeEntry } from "@/types";

interface EditTimeEntryDialogProps {
  entry: TimeEntry | null;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
    customer?: { id: string; name: string } | null;
  }>;
  customers: Array<{ id: string; name: string }>;
  onSave: (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    duration: number;
    hourlyRate?: number;
    currency?: string;
    startTime?: string;
  }) => void;
}

export function EditTimeEntryDialog({
  projects,
  customers,
  onSave,
}: EditTimeEntryDialogProps) {
  const { editTimeEntryDialog, setEditTimeEntryDialog } = useDialogStore();
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const { duration, setDuration } = useTimeEntryStore();

  const [formData, setFormData] = useState({
    taskName: "",
    projectId: "",
    customerId: "",
    description: "",
    startTime: new Date().toISOString(),
  });

  useEffect(() => {
    const loadEntry = async () => {
      if (editTimeEntryDialog.entryId) {
        const { data, error } = await supabase
          .from("time_entries")
          .select(
            `
            *,
            project:projects!left(id, name, color, customer:customers!left(
              id, name, customer_rates(hourly_rate, currency)
            ))
          `,
          )
          .eq("id", editTimeEntryDialog.entryId)
          .single();

        if (error) {
          handleError(error, "EditTimeEntryDialog");
          return;
        }

        setEntry(data);
        setFormData({
          taskName: data.task_name || "",
          projectId: data.project?.id || "",
          customerId: data.project?.customer?.id || "",
          description: data.description || "",
          startTime: data.start_time,
        });
        setDuration(data.duration);
      }
    };

    if (editTimeEntryDialog.isOpen) {
      loadEntry();
    }
  }, [editTimeEntryDialog.isOpen, editTimeEntryDialog.entryId, setDuration]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleSave = async () => {
    try {
      const validDuration = Math.max(0, duration);
      onSave({
        ...formData,
        duration: validDuration,
        startTime: formData.startTime,
      });
      toast.success("Time entry updated successfully");
      setEditTimeEntryDialog(false, null);
    } catch (error) {
      handleError(error, "EditTimeEntryDialog");
    }
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  const DialogComponent = isMobile ? MobileDialog : Dialog;
  const DialogContentComponent = isMobile ? MobileDialogContent : DialogContent;
  const DialogHeaderComponent = isMobile ? MobileDialogHeader : DialogHeader;
  const DialogTitleComponent = isMobile ? MobileDialogTitle : DialogTitle;

  return (
    <DialogComponent
      open={editTimeEntryDialog.isOpen}
      onOpenChange={(open) =>
        setEditTimeEntryDialog(open, editTimeEntryDialog.entryId)
      }
    >
      <DialogContentComponent
        className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeaderComponent className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <DialogTitleComponent className="text-lg font-semibold tracking-tight">
              Edit Time Entry
            </DialogTitleComponent>
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
                <div className="mt-2">
                  <Label className="text-sm text-muted-foreground mb-2">
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
        </DialogHeaderComponent>

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
                        {customer.name}
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
              onClick={() => setEditTimeEntryDialog(false, null)}
              className="h-12 flex-1 rounded-xl border-border/50 hover:bg-accent/50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-12 flex-1 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContentComponent>
    </DialogComponent>
  );
}
