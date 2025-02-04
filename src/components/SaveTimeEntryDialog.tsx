import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  Tag as TagIcon,
  ChevronsUpDown,
  X,
  Building2,
  FolderKanban,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface SaveTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  projectId: string;
  customerId?: string;
  duration: number;
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers?: Array<{ id: string; name: string }>;
  availableTags?: Array<{ value: string; label: string }>;
  onSave: (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }) => void;
}

export function SaveTimeEntryDialog({
  open,
  onOpenChange,
  taskName: initialTaskName,
  projectId: initialProjectId,
  duration,
  customerId = "",
  projects = [],
  customers = [],
  availableTags = [],
  onSave,
}: SaveTimeEntryDialogProps) {
  const [formData, setFormData] = useState<{
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }>({
    taskName:
      initialTaskName ||
      localStorage.getItem(STORAGE_KEYS.LAST_TASK_NAME) ||
      "",
    projectId:
      initialProjectId ||
      localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT_ID) ||
      "",
    customerId:
      customerId ||
      localStorage.getItem(STORAGE_KEYS.SELECTED_CUSTOMER_ID) ||
      "",
    description: localStorage.getItem(STORAGE_KEYS.LAST_DESCRIPTION) || "",
    tags: [] as string[],
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  useEffect(() => {
    // Update form data when props change
    setFormData((prev) => ({
      ...prev,
      taskName: initialTaskName || prev.taskName,
      projectId: initialProjectId || prev.projectId,
      customerId: customerId || prev.customerId,
    }));
  }, [initialTaskName, initialProjectId, customerId]);

  const handleSave = () => {
    onSave(formData);
    // Clear all storage data
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    setFormData((prev) => ({
      ...prev,
      description: "",
      tags: [],
    }));
    onOpenChange(false);
  };

  const selectedProject = projects.find((p) => p.id === formData.projectId);
  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden fixed left-0 top-0 right-0 bottom-0 sm:left-[50%] sm:top-[50%] sm:right-auto sm:bottom-auto sm:translate-x-[-50%] sm:translate-y-[-50%] w-full sm:w-[95vw] md:w-[90vw] lg:w-[85vw] min-h-[100dvh] sm:min-h-0 sm:max-h-[90vh] border-0 sm:border sm:rounded-2xl bg-background shadow-2xl data-[state=open]:duration-300 data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]">
        <div id="save-time-entry-description" className="sr-only">
          Save your time entry with details including customer, project, task
          name, tags, and description.
        </div>
        <DialogHeader className="p-6 pb-0 sticky top-0 z-20 bg-background/95 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Save Time Entry
              </DialogTitle>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card/50 dark:bg-card/30 border border-border/50 rounded-xl p-4 transition-all duration-300 ease-in-out hover:bg-card/70 dark:hover:bg-card/40">
                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-mono text-2xl font-bold tracking-wider text-foreground">
                    {formatDuration(duration)}
                  </div>
                </div>
              </div>

              <div className="bg-card/50 dark:bg-card/30 border border-border/50 rounded-xl p-4 transition-all duration-300 ease-in-out hover:bg-card/70 dark:hover:bg-card/40">
                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">
                    Start Time
                  </div>
                  <div className="font-mono text-2xl font-bold tracking-wider text-foreground">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden dialog-body">
          <ScrollArea className="flex-1 h-[calc(100dvh-20rem)] sm:h-[500px] overflow-y-auto">
            <div className="p-6 space-y-6">
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
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="min-w-[220px]">
                      {customers.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id}
                          className="py-3"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{customer.name}</span>
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
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="min-w-[220px]">
                      {projects
                        .filter(
                          (project) =>
                            project.customer_id === formData.customerId,
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
                              <FolderKanban className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{project.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="save-task-name">Task Name</Label>
                <Input
                  id="save-task-name"
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taskName: e.target.value,
                    }))
                  }
                  placeholder="What did you work on?"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 py-1.5 px-3 h-8"
                      >
                        <TagIcon className="h-3 w-3" />
                        <span className="text-xs">
                          {availableTags.find((t) => t.value === tag)?.label}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((t) => t !== tag),
                            }))
                          }
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4" />
                        <span>Add tags</span>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <ScrollArea className="h-[200px]">
                      <div className="p-2 space-y-1">
                        {availableTags.map((tag) => (
                          <button
                            key={tag.value}
                            className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${formData.tags.includes(tag.value) ? "bg-accent" : ""}`}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                tags: prev.tags.includes(tag.value)
                                  ? prev.tags.filter((t) => t !== tag.value)
                                  : [...prev.tags, tag.value],
                              }))
                            }
                          >
                            <TagIcon className="h-3 w-3" />
                            <span>{tag.label}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="save-description">Description</Label>
                <Textarea
                  id="save-description"
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
        </div>

        <div className="flex items-center gap-3 p-6 bg-background/95 backdrop-blur-xl border-t border-border/50 sticky bottom-0 safe-area-bottom z-20">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-xl px-8 hover:bg-muted/50 transition-all duration-200"
          >
            <span className="font-medium">Cancel</span>
          </Button>
          <Button
            type="button"
            onClick={() => {
              handleSave();
              onOpenChange(false);
            }}
            className="flex-1 h-12 rounded-xl font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            disabled={!formData.taskName}
          >
            <span className="font-medium">Save Entry</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
