import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeEntry } from "@/types";
import { useTimeEntryStore } from "@/store/timeEntryStore";
import { useAuth } from "@/lib/auth";
import { Clock } from "lucide-react";

interface EditTimeEntryDialogProps {
  entry: TimeEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
    customer?: {
      id: string;
      name: string;
      customer_rates?: Array<{
        hourly_rate: number;
        currency: string;
      }>;
    };
  }>;
  customers: Array<{
    id: string;
    name: string;
    customer_rates?: Array<{
      hourly_rate: number;
      currency: string;
    }>;
  }>;
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
  entry,
  open,
  onOpenChange,
  projects,
  customers,
  onSave,
}: EditTimeEntryDialogProps) {
  const initialRender = useRef(true);
  const { duration, setDuration } = useTimeEntryStore();
  const { user } = useAuth();

  useEffect(() => {
    if (open && initialRender.current) {
      const activeElement = document.activeElement as HTMLElement;
      activeElement?.blur?.();
      initialRender.current = false;
    }
  }, [open]);

  const [formData, setFormData] = useState({
    taskName: entry.task_name,
    projectId: entry.project?.id || "",
    customerId: entry.project?.customer?.id || "",
    description: entry.description || "",
    hourlyRate: 0,
    currency: "USD",
    startTime: entry.start_time,
  });

  const loadCustomerRate = useCallback(async (customerId: string) => {
    try {
      const { data: rateData, error: rateError } = await supabase
        .from("customer_rates")
        .select("hourly_rate, currency")
        .eq("customer_id", customerId)
        .maybeSingle();

      if (rateError) throw rateError;

      if (rateData) {
        setFormData((prev) => ({
          ...prev,
          hourlyRate: rateData.hourly_rate,
          currency: rateData.currency,
        }));
      }
    } catch (error) {
      handleError(error, "EditTimeEntryDialog");
    }
  }, []);

  useEffect(() => {
    if (open) {
      setFormData({
        taskName: entry.task_name,
        projectId: entry.project?.id || "",
        customerId: entry.project?.customer?.id || "",
        description: entry.description || "",
        hourlyRate: 0,
        currency: "USD",
        startTime: entry.start_time,
      });
      setDuration(entry.duration);

      if (entry.project?.customer?.id) {
        loadCustomerRate(entry.project.customer.id);
      }
    }
  }, [open, entry, setDuration, loadCustomerRate]);

  // Load customer rate when customer changes
  useEffect(() => {
    if (formData.customerId) {
      loadCustomerRate(formData.customerId);
    }
  }, [formData.customerId, loadCustomerRate]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validDuration = Math.max(0, duration);

      console.debug("EditTimeEntryDialog - Saving with data:", {
        ...formData,
        duration: validDuration,
      });

      // Update time entry
      const { error: entryError } = await supabase
        .from("time_entries")
        .update({
          task_name: formData.taskName,
          description: formData.description,
          project_id: formData.projectId || null,
          duration: validDuration,
          start_time: formData.startTime,
        })
        .eq("id", entry.id);

      if (entryError) throw entryError;

      // Update or insert customer rate only if user is admin
      if (user?.role === "admin" && formData.customerId) {
        const { error: rateError } = await supabase
          .from("customer_rates")
          .upsert({
            customer_id: formData.customerId,
            hourly_rate: formData.hourlyRate,
            currency: formData.currency,
            updated_at: new Date().toISOString(),
          });

        if (rateError) throw rateError;
      }

      // Create data object based on user role
      const updatedData = {
        taskName: formData.taskName,
        projectId: formData.projectId,
        customerId: formData.customerId,
        description: formData.description,
        duration: validDuration,
        startTime: formData.startTime,
        ...(user?.role === "admin"
          ? {
              hourlyRate: formData.hourlyRate,
              currency: formData.currency,
            }
          : {}),
      };

      toast.success("Time entry updated successfully", {
        description: `Updated ${formData.taskName} - ${formatDuration(validDuration)}`,
      });
      onSave(updatedData);
    } catch (error) {
      handleError(error, "EditTimeEntryDialog");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10">
        <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit Time Entry
            </DialogTitle>
          </div>
          <DialogDescription>
            Edit your time entry details including task name, project, and
            description
          </DialogDescription>

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
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-sm text-muted-foreground">
                    Started at
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={
                        new Date(formData.startTime).toISOString().split("T")[0]
                      }
                      onChange={(e) => {
                        const [_, time] = new Date(formData.startTime)
                          .toISOString()
                          .split("T");
                        setFormData((prev) => ({
                          ...prev,
                          startTime: `${e.target.value}T${time}`,
                        }));
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="time"
                      value={new Date(formData.startTime)
                        .toISOString()
                        .split("T")[1]
                        .substring(0, 5)}
                      onChange={(e) => {
                        const [date] = new Date(formData.startTime)
                          .toISOString()
                          .split("T");
                        setFormData((prev) => ({
                          ...prev,
                          startTime: `${date}T${e.target.value}:00.000Z`,
                        }));
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100vh-20rem)] sm:max-h-[calc(100vh-22rem)] overflow-y-auto overscroll-none bg-gradient-to-b from-transparent via-background/50 to-background/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Task Name</Label>
                <Input
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taskName: e.target.value,
                    }))
                  }
                  placeholder="What did you work on?"
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
                      <ScrollArea className="max-h-[200px]">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
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
                      <ScrollArea className="max-h-[200px]">
                        {projects
                          .filter(
                            (project) =>
                              project.customer_id === formData.customerId,
                          )
                          .map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                <span>{project.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {user?.role === "admin" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Hourly Rate</Label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hourlyRate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="h-12 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger className="h-12 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="TRY">TRY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

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
            </form>
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
              className="h-12 flex-1 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
