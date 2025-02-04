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
import { Switch } from "@/components/ui/switch";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: "admin" | "user";
    active: boolean;
  };
  onSave: (data: {
    email: string;
    full_name: string;
    role: "admin" | "user";
    active: boolean;
    password?: string;
  }) => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserDialogProps) {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    full_name: user?.full_name || "",
    role: user?.role || "user",
    active: user?.active ?? true,
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        active: user.active,
        password: "",
      });
    } else {
      setFormData({
        email: "",
        full_name: "",
        role: "user",
        active: true,
        password: "",
      });
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Password {user && "(leave empty to keep current)"}</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={user ? "••••••••" : "Enter password"}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "user") =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, active: checked }))
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
              setFormData({
                email: "",
                full_name: "",
                role: "user",
                active: true,
                password: "",
              });
            }}
          >
            {user ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
