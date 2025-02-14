import { useState, useEffect, useRef } from "react";
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

interface EditTimeEntryDialogProps {
  entry: TimeEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers: Array<{ id: string; name: string }>;
  onSave: (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    duration: number;
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
  });

  useEffect(() => {
    if (open) {
      setFormData({
        taskName: entry.task_name,
        projectId: entry.project?.id || "",
        customerId: entry.project?.customer?.id || "",
        description: entry.description || "",
      });
      setDuration(entry.duration);
    }
  }, [open, entry, setDuration]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleSave = () => {
    const validDuration = Math.max(0, duration);

    console.debug("EditTimeEntryDialog - Saving with data:", {
      ...formData,
      duration: validDuration,
    });

    onSave({
      ...formData,
      duration: validDuration,
    });
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
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
