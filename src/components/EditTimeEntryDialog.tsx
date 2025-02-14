import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
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
        ...(user?.role === "admin"
          ? {
              hourlyRate: formData.hourlyRate,
              currency: formData.currency,
            }
          : {}),
      };

      showSuccess("Time entry updated successfully");
      onSave(updatedData);
    } catch (error) {
      handleError(error, "EditTimeEntryDialog");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
          <DialogDescription>
            Edit your time entry details including task name, project, and
            description
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>Task Name</Label>
            <Input
              value={formData.taskName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, taskName: e.target.value }))
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
