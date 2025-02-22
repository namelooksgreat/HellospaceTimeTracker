import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password || !formData.fullName) {
        throw new Error(
          language === "tr"
            ? "Tüm alanları doldurun"
            : "All fields are required",
        );
      }

      // No need to check users table - auth will handle this

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: "user",
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("User already registered");
        }
        throw authError;
      }

      if (!authData.user) throw new Error("User creation failed");

      // User settings will be created by a database trigger instead
      // This avoids RLS issues during registration

      toast.success(
        language === "tr" ? "Kayıt başarılı!" : "Registration successful!",
        {
          description:
            language === "tr"
              ? "Hesabınız başarıyla oluşturuldu."
              : "Your account has been created successfully.",
        },
      );

      // Reset form
      setFormData({
        email: "",
        password: "",
        fullName: "",
      });
    } catch (error: any) {
      if (error.message === "User already registered") {
        toast.error(
          language === "tr"
            ? "Bu e-posta adresi zaten kayıtlı"
            : "This email is already registered",
        );
      } else {
        toast.error(
          error.message ||
            (language === "tr"
              ? "Kayıt sırasında bir hata oluştu"
              : "An error occurred during registration"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{language === "tr" ? "Ad Soyad" : "Full Name"}</Label>
        <Input
          value={formData.fullName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
          }
          placeholder={
            language === "tr"
              ? "Adınızı ve soyadınızı girin"
              : "Enter your full name"
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          {language === "tr"
            ? "Bu isim profilinizde görüntülenecektir."
            : "This will be displayed on your profile."}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{language === "tr" ? "E-posta" : "Email"}</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder={
            language === "tr"
              ? "E-posta adresinizi girin"
              : "Enter your email address"
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          {language === "tr"
            ? "Bu e-posta ile hesabınıza giriş yapacaksınız."
            : "You'll use this email to log in to your account."}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{language === "tr" ? "Şifre" : "Password"}</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder={
            language === "tr"
              ? "Güvenli bir şifre seçin"
              : "Choose a secure password"
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          {language === "tr"
            ? "En az 8 karakter, harf, rakam ve sembol kullanın."
            : "Use at least 8 characters with a mix of letters, numbers & symbols."}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        {language === "tr" ? "Kayıt Ol" : "Sign Up"}
      </Button>
    </form>
  );
}
