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
import { useState, useRef } from "react";
import { Check, ChevronsUpDown, X, Tag as TagIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface SaveTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  projectId: string;
  customerId?: string;
  duration: string;
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
  const [taskName, setTaskName] = useState(initialTaskName);
  const [description, setDescription] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(
    customerId || customers[0].id,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openTagSelect, setOpenTagSelect] = useState(false);

  const handleSave = () => {
    onSave({
      taskName,
      projectId: initialProjectId,
      customerId: selectedCustomer,
      description,
      tags: selectedTags,
    });
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
            <div className="text-2xl font-mono font-semibold">{duration}</div>
          </div>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger className="w-full bg-[#2C2C2E] border-0 text-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2E] border-0">
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id}
                    className="text-white hover:bg-[#1C1C1E] focus:bg-[#1C1C1E]"
                  >
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="What did you work on?"
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
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
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() =>
                      setSelectedTags(selectedTags.filter((t) => t !== tag))
                    }
                  >
                    <X className="h-3 w-3 hover:text-muted-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
            <Select
              onValueChange={(value) => {
                setSelectedTags((prev) =>
                  prev.includes(value)
                    ? prev.filter((t) => t !== value)
                    : [...prev, value],
                );
              }}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
                    : "Select tags..."}
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.value} value={tag.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {selectedTags.includes(tag.value) && (
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
