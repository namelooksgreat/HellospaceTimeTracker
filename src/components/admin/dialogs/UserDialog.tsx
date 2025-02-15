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
import { supabase } from "@/lib/supabase";

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
    default_rate: 0,
    currency: "USD",
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
      const loadUserData = async () => {
        try {
          setFormData({
            full_name: user.full_name || "",
            user_type: user.user_type || "user",
            default_rate: 0,
            currency: "USD",
          });

          // Load user settings
          const { data: settingsData, error: settingsError } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (settingsError) {
            console.error("Error loading user settings:", settingsError);
            return;
          }

          if (settingsData) {
            setFormData((prev) => ({
              ...prev,
              default_rate: settingsData.default_rate,
              currency: settingsData.currency,
            }));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };

      loadUserData();
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update user data
      await updateUser(user.id, {
        full_name: formData.full_name,
        user_type: formData.user_type,
      });

      // First check if settings exist
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Update or insert based on existence
      const { error: settingsError } = existingSettings
        ? await supabase
            .from("user_settings")
            .update({
              default_rate: formData.default_rate,
              currency: formData.currency,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
        : await supabase.from("user_settings").insert({
            user_id: user.id,
            default_rate: formData.default_rate,
            currency: formData.currency,
            updated_at: new Date().toISOString(),
          });

      if (settingsError) throw settingsError;

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Saatlik Ücret</Label>
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
                placeholder="Saatlik ücret"
              />
            </div>

            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
