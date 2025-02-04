import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    id: string;
    name: string;
    color: string;
    customer_id: string;
  };
  customers: Array<{ id: string; name: string }>;
  onSave: (data: { name: string; color: string; customer_id: string }) => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  customers,
  onSave,
}: ProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    color: project?.color || "#4F46E5",
    customer_id: project?.customer_id || "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        color: project.color,
        customer_id: project.customer_id,
      });
    } else {
      setFormData({
        name: "",
        color: "#4F46E5",
        customer_id: "",
      });
    }
  }, [project]);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        color: project.color,
        customer_id: project.customer_id,
      });
    } else {
      setFormData({
        name: "",
        color: "#4F46E5",
        customer_id: "",
      });
    }
  }, [project]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Customer</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, customer_id: value }))
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
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-12 h-12 p-1"
              />
              <Input
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(formData);
              setFormData({
                name: "",
                color: "#4F46E5",
                customer_id: "",
              });
            }}
          >
            {project ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
