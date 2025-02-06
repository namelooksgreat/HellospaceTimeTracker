import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Building2, Clock } from "lucide-react";
import { TimeEntry } from "@/types";

interface EditTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntry;
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
  }) => void;
}

export function EditTimeEntryDialog({
  open,
  onOpenChange,
  entry,
  projects,
  customers,
  onSave,
}: EditTimeEntryDialogProps) {
  const [formData, setFormData] = useState({
    taskName: entry.task_name,
    projectId: entry.project?.id || "",
    customerId: entry.project?.customer_id || "",
    description: entry.description || "",
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10">
        <DialogDescription className="sr-only">
          Edit your time entry details including task name, project, and
          description
        </DialogDescription>
        <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit Time Entry
            </DialogTitle>
            <p id="dialog-description" className="sr-only">
              Edit your time entry details including task name, project, and
              description
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary">
                  {formatDuration(entry.duration)}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">Start Time</div>
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary">
                  {new Date(entry.start_time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100vh-20rem)] sm:max-h-[calc(100vh-22rem)] overflow-y-auto overscroll-none bg-gradient-to-b from-transparent via-background/50 to-background/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
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
                  <SelectTrigger className="h-12 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="max-h-[280px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg dark:bg-popover/90"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                  >
                    <ScrollArea className="max-h-[280px]">
                      {customers.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id}
                          className="py-2.5 cursor-pointer focus:bg-accent/50"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{customer.name}</span>
                          </div>
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
                  <SelectTrigger className="h-12 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50">
                    <SelectValue
                      placeholder={
                        formData.customerId
                          ? "Select project"
                          : "Select customer first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="max-h-[280px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg dark:bg-popover/90"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                  >
                    <ScrollArea className="max-h-[280px]">
                      {projects
                        .filter(
                          (project) =>
                            project.customer_id === formData.customerId,
                        )
                        .map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id}
                            className="py-2.5 cursor-pointer focus:bg-accent/50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full ring-1 ring-border/50 shrink-0"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="truncate">{project.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={formData.taskName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    taskName: e.target.value,
                  }))
                }
                placeholder="What did you work on?"
                className="h-12 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50 focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Add any additional notes..."
                className="min-h-[100px] bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50 focus-visible:ring-primary/50"
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
              type="button"
              onClick={handleSave}
              className="h-12 flex-1 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              disabled={!formData.taskName}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
