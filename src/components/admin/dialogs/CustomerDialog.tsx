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

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: {
    id: string;
    name: string;
  };
  onSave: (data: { name: string }) => void;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
      });
    } else {
      setFormData({
        name: "",
      });
    }
  }, [customer]);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
      });
    } else {
      setFormData({
        name: "",
      });
    }
  }, [customer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
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
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(formData);
              setFormData({ name: "" });
            }}
          >
            {customer ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
