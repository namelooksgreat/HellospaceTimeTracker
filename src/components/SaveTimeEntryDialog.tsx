import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState, useEffect } from "react";
import { Check, X, Tag as TagIcon } from "lucide-react";
import { Badge } from "./ui/badge";

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
  customers = [
    { id: "1", name: "Customer 1" },
    { id: "2", name: "Customer 2" },
    { id: "3", name: "Customer 3" },
  ],
  availableTags = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "documentation", label: "Documentation" },
    { value: "design", label: "Design" },
    { value: "testing", label: "Testing" },
  ],
  onSave,
}: SaveTimeEntryDialogProps) {
  const [formData, setFormData] = useState({
    taskName: initialTaskName,
    projectId: initialProjectId,
    customerId: customerId,
    description: localStorage.getItem("lastDescription") || "",
    tags: [] as string[],
  });

  // Update form data when props change
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
    // Clear all storage
    localStorage.removeItem("lastTaskName");
    localStorage.removeItem("lastDescription");
    localStorage.removeItem("selectedProjectId");
    localStorage.removeItem("selectedCustomerId");

    // Reset form data
    setFormData((prev) => ({
      ...prev,
      description: "",
      tags: [],
    }));

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-border rounded-xl">
        <DialogHeader>
          <DialogTitle>Save Time Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects
                  .filter(
                    (project) => project.customer_id === formData.customerId,
                  )
                  .map((project) => (
                    <SelectItem key={project.id} value={project.id}>
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
                setFormData((prev) => ({ ...prev, taskName: e.target.value }))
              }
              placeholder="What did you work on?"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <TagIcon className="h-3 w-3" />
                  {availableTags.find((t) => t.value === tag)?.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((t) => t !== tag),
                        }));
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
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
            <Select
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  tags: prev.tags.includes(value)
                    ? prev.tags.filter((t) => t !== value)
                    : [...prev.tags, value],
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  {formData.tags.length > 0
                    ? `${formData.tags.length} tag${formData.tags.length > 1 ? "s" : ""} selected`
                    : "Select tags..."}
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.value} value={tag.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {formData.tags.includes(tag.value) && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      {tag.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
