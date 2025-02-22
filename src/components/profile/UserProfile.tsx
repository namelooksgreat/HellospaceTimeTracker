import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
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
import { Camera, LogOut, Loader2, User } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { toast } from "sonner";
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

      showSuccess("Profile photo updated");
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
      // Update auth user data
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: formData.full_name },
      });
      if (authError) throw authError;

      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: formData.full_name })
        .eq("id", user.id);
      if (userError) throw userError;

      // Delete existing settings first to avoid conflicts
      await supabase.from("user_settings").delete().eq("user_id", user.id);

      // Insert new settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          default_rate: formData.hourly_rate,
          currency: formData.currency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (settingsError) throw settingsError;

      // Refresh settings data
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("default_rate, currency")
        .eq("user_id", user.id)
        .single();

      if (settingsData) {
        setFormData((prev) => ({
          ...prev,
          hourly_rate: settingsData.default_rate,
          currency: settingsData.currency,
        }));
      }

      showSuccess("Profile information updated successfully");
    } catch (error) {
      handleError(error, "UserProfile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="relative overflow-hidden bg-background border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
        <CardContent className="relative z-10 p-6 space-y-6">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold tracking-tight">
              Profile Information
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group/avatar">
              <div className="relative w-fit rounded-full p-[2px] bg-border/50">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-1 ring-border/50">
                  <AvatarImage
                    id="profile-avatar"
                    src={
                      user.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                    }
                  />
                  <AvatarFallback className="text-lg">
                    {user.full_name?.[0] || user.email[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
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
                size="icon"
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-background/95 hover:bg-accent/80 transition-all duration-150 border border-border shadow-lg opacity-0 group-hover/avatar:opacity-100 scale-90 group-hover/avatar:scale-100"
                disabled={loading}
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {user.full_name || "Add your name"}
              </h3>
              <div className="mt-1">
                {user.user_type && (
                  <RoleBadge role={user.user_type as UserRole} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                placeholder="Enter your full name"
                className="bg-background/50 hover:bg-accent/50 transition-all duration-150"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Hourly Rate</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
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
                  className={cn(
                    "bg-background/50 hover:bg-accent/50 transition-all duration-150",
                    user.user_type !== "admin" && "bg-muted hover:bg-muted",
                  )}
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                  disabled={user.user_type !== "admin"}
                >
                  <SelectTrigger className="bg-background/50 hover:bg-accent/50 transition-all duration-150">
                    <SelectValue placeholder="Currency" />
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
                  ? "Set the hourly rate for this user."
                  : "Only administrators can change hourly rates."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 z-50">
        <div className="flex gap-3 max-w-xl mx-auto">
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              try {
                const hour = new Date().getHours();
                let message = "";

                if (hour >= 5 && hour < 12) {
                  message = "Günaydın! İyi günler dileriz.";
                } else if (hour >= 12 && hour < 18) {
                  message = "İyi günler! Tekrar görüşmek üzere.";
                } else if (hour >= 18 && hour < 22) {
                  message = "İyi akşamlar! Yarın görüşmek üzere.";
                } else {
                  message = "İyi geceler! Yarın görüşmek üzere.";
                }

                toast.success(message);
                await useAuthStore.getState().signOut();
              } catch (error) {
                handleError(error, "UserProfile");
              }
            }}
            className="h-12 flex-1 rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 flex-1 rounded-xl bg-foreground text-background hover:bg-background hover:text-foreground dark:hover:bg-black dark:hover:text-white border border-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
