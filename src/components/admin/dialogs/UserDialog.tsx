import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "@/lib/api/users";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { User } from "@/types";

interface UserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function UserDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "user",
    default_rate: 0,
    currency: "USD",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: "",
        full_name: user.full_name || "",
        user_type: user.user_type,
        default_rate: 0,
        currency: "USD",
      });
    } else {
      setFormData({
        email: "",
        password: "",
        full_name: "",
        user_type: "user",
        default_rate: 0,
        currency: "USD",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setLoading(true);
    try {
      if (user?.id) {
        await updateUser(user.id, {
          full_name: formData.full_name,
          user_type: formData.user_type,
        });
        showSuccess("User updated successfully");
      } else {
        if (!formData.password) {
          throw new Error("Password is required");
        }
        await createUser({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          user_type: formData.user_type,
          default_rate: formData.default_rate,
          currency: formData.currency,
        });
        showSuccess("User created successfully");
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "UserDialog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "New User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Edit user information and role."
              : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={!!user}
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, user_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!user && formData.user_type !== "user" && (
            <div className="space-y-2">
              <Label>Default Rate</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={formData.default_rate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      default_rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  step="0.01"
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
