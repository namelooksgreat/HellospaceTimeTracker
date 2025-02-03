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
import { useState } from "react";

interface SaveTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  projectId: string;
  customerId?: string;
  duration: string;
  customers?: Array<{ id: string; name: string }>;
  onSave: (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
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
  onSave,
}: SaveTimeEntryDialogProps) {
  const [taskName, setTaskName] = useState(initialTaskName);
  const [description, setDescription] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(
    customerId || customers[0].id,
  );

  const handleSave = () => {
    onSave({
      taskName,
      projectId: initialProjectId,
      customerId: selectedCustomer,
      description,
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
