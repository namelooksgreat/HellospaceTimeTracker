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
import { updateUser, getUserTypes, User, UserType } from "@/lib/api/users";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";

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
  const [formData, setFormData] = useState({
    full_name: "",
    user_type: "",
  });
  const [loading, setLoading] = useState(false);

  // Sabit rol seçenekleri
  const userRoles = [
    { value: "user", label: "Kullanıcı" },
    { value: "admin", label: "Yönetici" },
    { value: "developer", label: "Geliştirici" },
  ];

  useEffect(() => {
    if (user && open) {
      setFormData({
        full_name: user.full_name || "",
        user_type: user.user_type || "user",
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUser(user.id, formData);
      showSuccess("Kullanıcı başarıyla güncellendi");
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
          <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          <DialogDescription>
            Kullanıcı bilgilerini düzenleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Ad Soyad"
            />
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, user_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
