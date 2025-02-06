import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { AvatarService } from "@/lib/services/avatarService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Camera, Loader2, LogOut } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";

interface UserProfileProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        if (currentUser?.user_metadata?.full_name) {
          setFormData((prev) => ({
            ...prev,
            full_name: currentUser.user_metadata.full_name,
          }));
        }
      } catch (error) {
        handleError(error, "UserProfile");
      }
    };

    fetchUserData();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      // Delete old avatar first
      await AvatarService.deleteOldAvatar(user.id);

      // Upload new avatar
      const { publicUrl, error } = await AvatarService.uploadAvatar(
        file,
        user.id,
      );

      if (error) throw error;

      // Update avatar image in UI
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
      showSuccess("Profil başarıyla güncellendi");
    } catch (error) {
      handleError(error, "UserProfile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <CardContent className="p-0 space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage
                id="profile-avatar"
                src={
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                }
              />
              <AvatarFallback>
                {user.full_name?.[0] || user.email[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-medium">
                {user.full_name || "Add your name"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="relative">
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
                  className="mt-2"
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
