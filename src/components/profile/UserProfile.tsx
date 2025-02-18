import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { AvatarService } from "@/lib/services/avatarService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { RoleBadge } from "../ui/role-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Camera, LogOut, Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { UserRole } from "@/types/roles";

interface UserProfileProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    user_type?: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email,
    hourly_rate: 0,
    currency: "USD",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, settingsResponse, userDataResponse] =
          await Promise.all([
            supabase.auth.getUser(),
            supabase
              .from("user_settings")
              .select("default_rate, currency")
              .eq("user_id", user.id)
              .single(),
            supabase
              .from("users")
              .select("user_type")
              .eq("id", user.id)
              .single(),
          ]);

        if (userResponse.error) throw userResponse.error;
        if (userDataResponse.error) throw userDataResponse.error;

        if (userDataResponse.data?.user_type) {
          user.user_type = userDataResponse.data.user_type;
        }

        if (userResponse.data.user?.user_metadata?.full_name) {
          setFormData((prev) => ({
            ...prev,
            full_name: userResponse.data.user.user_metadata.full_name,
          }));
        }

        if (!settingsResponse.error && settingsResponse.data) {
          setFormData((prev) => ({
            ...prev,
            hourly_rate: settingsResponse.data.default_rate,
            currency: settingsResponse.data.currency || "USD",
          }));
        } else if (
          settingsResponse.error &&
          settingsResponse.error.code !== "PGRST116"
        ) {
          throw settingsResponse.error;
        }
      } catch (error) {
        handleError(error, "UserProfile");
      }
    };

    fetchUserData();
  }, [user.id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      await AvatarService.deleteOldAvatar(user.id);
      const { publicUrl, error } = await AvatarService.uploadAvatar(
        file,
        user.id,
      );

      if (error) throw error;

      const avatarImage = document.querySelector(
        "#profile-avatar",
      ) as HTMLImageElement;
      if (avatarImage) {
        avatarImage.src = publicUrl;
      }

      showSuccess("Profil fotoğrafı güncellendi");
    } catch (error) {
      handleError(error, "UserProfile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.full_name },
      });

      if (error) throw error;

      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          default_rate: formData.hourly_rate,
          currency: formData.currency,
          updated_at: new Date().toISOString(),
        });

      if (settingsError) throw settingsError;

      const { data: settingsData, error: fetchError } = await supabase
        .from("user_settings")
        .select("default_rate, currency")
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      if (settingsData) {
        setFormData((prev) => ({
          ...prev,
          hourly_rate: settingsData.default_rate,
          currency: settingsData.currency,
        }));
      }

      showSuccess("Profil başarıyla güncellendi");
    } catch (error) {
      handleError(error, "UserProfile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center sm:items-start gap-4 sm:flex-col">
              <Avatar className="w-16 h-16 sm:w-24 sm:h-24 ring-2 ring-primary/20">
                <AvatarImage
                  id="profile-avatar"
                  src={
                    user.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-2xl">
                  {user.full_name?.[0] || user.email[0]}
                </AvatarFallback>
              </Avatar>
              <div className="relative sm:w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={loading}
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  Fotoğraf Değiştir
                </Button>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold truncate">
                    {user.full_name || "Add your name"}
                  </h3>
                  {user.user_type && (
                    <RoleBadge role={user.user_type as UserRole} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Saatlik Ücret</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={formData.hourly_rate}
                      disabled={user.user_type !== "admin"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hourly_rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      step="0.01"
                      className={user.user_type !== "admin" ? "bg-muted" : ""}
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={(value: string) =>
                        setFormData((prev) => ({ ...prev, currency: value }))
                      }
                      disabled={user.user_type !== "admin"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Para birimi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="TRY">TRY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.user_type === "admin"
                      ? "Bu kullanıcı için saatlik ücreti ayarlayın."
                      : "Sadece yöneticiler saatlik ücretleri değiştirebilir."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="destructive"
          onClick={async () => {
            try {
              await useAuthStore.getState().signOut();
            } catch (error) {
              handleError(error, "UserProfile");
            }
          }}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Değişiklikleri Kaydet
        </Button>
      </div>
    </form>
  );
}
