import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function UserSecurity() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user?.email) throw new Error("User not found");

    if (!formData.currentPassword) {
      handleError(
        new Error(
          language === "tr"
            ? "Mevcut şifre gerekli"
            : "Current password is required",
        ),
        "UserSecurity",
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      handleError(
        new Error(
          language === "tr" ? "Şifreler eşleşmiyor" : "Passwords do not match",
        ),
        "UserSecurity",
      );
      return;
    }

    if (formData.newPassword.length < 6) {
      handleError(
        new Error(
          language === "tr"
            ? "Şifre en az 6 karakter olmalı"
            : "Password must be at least 6 characters",
        ),
        "UserSecurity",
      );
      return;
    }

    setLoading(true);
    try {
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: formData.currentPassword,
      });

      if (signInError) {
        throw new Error(
          language === "tr"
            ? "Mevcut şifre yanlış"
            : "Current password is incorrect",
        );
      }

      // Then update to new password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      showSuccess(
        language === "tr"
          ? "Şifre başarıyla güncellendi"
          : "Password updated successfully",
      );

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      handleError(error, "UserSecurity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-background border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-foreground">
          <Lock className="h-5 w-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            {language === "tr" ? "Güvenlik Ayarları" : "Security Settings"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              {language === "tr" ? "Mevcut Şifre" : "Current Password"}
            </Label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              placeholder={
                language === "tr"
                  ? "Mevcut şifrenizi girin"
                  : "Enter your current password"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "tr" ? "Yeni Şifre" : "New Password"}</Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder={
                language === "tr"
                  ? "Yeni şifrenizi girin"
                  : "Enter your new password"
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              {language === "tr"
                ? "En az 8 karakter, harf, rakam ve sembol kullanın."
                : "Use at least 8 characters with a mix of letters, numbers & symbols."}
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              {language === "tr" ? "Yeni Şifre Tekrar" : "Confirm New Password"}
            </Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder={
                language === "tr"
                  ? "Yeni şifrenizi tekrar girin"
                  : "Confirm your new password"
              }
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-foreground text-background hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === "tr" ? "Şifreyi Güncelle" : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
