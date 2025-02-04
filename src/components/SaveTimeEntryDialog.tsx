import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { Tag as TagIcon, ChevronsUpDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";

interface SaveTimeEntryDialogProps {
  isEditing?: boolean;
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
  isEditing = false,
}: SaveTimeEntryDialogProps) {
  const [formData, setFormData] = useState<{
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }>({
    taskName: initialTaskName,
    projectId: initialProjectId,
    customerId: customerId,
    description: localStorage.getItem("lastDescription") || "",
    tags: [] as string[],
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      taskName: initialTaskName,
      projectId: initialProjectId,
      customerId: customerId,
    }));
  }, [initialTaskName, initialProjectId, customerId]);

  const handleSave = () => {
    onSave(formData);
    localStorage.removeItem("lastTaskName");
    localStorage.removeItem("lastDescription");
    localStorage.removeItem("selectedProjectId");
    localStorage.removeItem("selectedCustomerId");
    setFormData((prev) => ({
      ...prev,
      description: "",
      tags: [],
    }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="dialog-content"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          e.preventDefault();
          // Only close on backdrop click, not on content click
          if (e.target.getAttribute("data-radix-dialog-overlay") !== null) {
            onOpenChange(false);
          }
        }}
      >
        <div className="dialog-header">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
              {isEditing ? "Edit Time Entry" : "Save Time Entry"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-10 px-5 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        <div className="dialog-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="text-2xl font-mono font-semibold">
                  {Math.floor(duration / 3600)}h{" "}
                  {Math.floor((duration % 3600) / 60)}m {duration % 60}s
                </div>
              </div>

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
                  <SelectTrigger className="h-12 bg-muted/50 border-input/50">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent
                    className="select-content"
                    position="item-aligned"
                  >
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer.id}
                        className="select-item"
                      >
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
                  <SelectTrigger className="h-12 bg-muted/50 border-input/50">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent
                    className="select-content"
                    position="item-aligned"
                  >
                    {projects
                      .filter(
                        (project) =>
                          project.customer_id === formData.customerId,
                      )
                      .map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="py-3 cursor-pointer focus:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskName">Task Name</Label>
                <Input
                  id="taskName"
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taskName: e.target.value,
                    }))
                  }
                  placeholder="What did you work on?"
                  className="h-12 bg-muted/50 border-input/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 h-8 text-sm px-3"
                    >
                      <TagIcon className="h-3 w-3" />
                      {availableTags.find((t) => t.value === tag)?.label}
                      <button
                        type="button"
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((t) => t !== tag),
                          }))
                        }
                      >
                        <X className="h-3 w-3 hover:text-muted-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-12 bg-muted/50 border-input/50 text-left"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TagIcon className="h-4 w-4" />
                        Select tags...
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[calc(100vw-2rem)] sm:w-[var(--radix-popover-trigger-width)] p-0 select-content"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                    alignOffset={0}
                    avoidCollisions={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="w-full max-h-[300px] overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                      <div className="p-2 space-y-1">
                        {availableTags.map((tag) => (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => {
                              if (!formData.tags.includes(tag.value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  tags: [...prev.tags, tag.value],
                                }));
                                const popoverContent = document.querySelector(
                                  "[data-radix-popper-content-wrapper]",
                                );
                                if (popoverContent) {
                                  const event = new KeyboardEvent("keydown", {
                                    key: "Escape",
                                    bubbles: true,
                                  });
                                  popoverContent.dispatchEvent(event);
                                }
                              }
                            }}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-4 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-medium">{tag.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      description: newValue,
                    }));
                    localStorage.setItem("lastDescription", newValue);
                  }}
                  placeholder="Add any additional details..."
                  className="min-h-[100px] bg-muted/50 border-input/50"
                />
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
