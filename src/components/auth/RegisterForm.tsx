import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import {
  validateInvitation,
  markInvitationAsUsed,
} from "@/lib/api/invitations";

interface RegisterFormProps {
  inviteToken?: string | null;
  inviteEmail?: string | null;
}

export function RegisterForm({ inviteToken, inviteEmail }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const { language } = useLanguage();

  // Validate invitation token if present
  useEffect(() => {
    const validateToken = async () => {
      if (!inviteToken) return;

      try {
        setLoading(true);
        console.log("Validating invitation token:", inviteToken);

        // Pre-fill email from URL parameter first if available
        if (inviteEmail) {
          console.log("Using email from URL parameter:", inviteEmail);
          setFormData((prev) => ({
            ...prev,
            email: inviteEmail,
          }));
        }

        const validation = await validateInvitation(inviteToken);
        console.log("Validation result:", validation);

        if (!validation.is_valid) {
          toast.error(
            language === "tr"
              ? "Davet linki geçersiz veya süresi dolmuş"
              : "Invalid or expired invitation link",
          );
          return;
        }

        // If email wasn't set from URL, use the one from validation
        if (!inviteEmail && validation.email) {
          console.log("Using email from validation:", validation.email);
          setFormData((prev) => ({
            ...prev,
            email: validation.email || "",
          }));
        }
      } catch (error) {
        console.error("Error validating invitation:", error);
        handleError(error, "RegisterForm");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [inviteToken, language, inviteEmail]);

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

      // If using invitation, validate again
      let userRole = "user";
      if (inviteToken) {
        const validation = await validateInvitation(inviteToken);
        if (!validation.is_valid) {
          throw new Error(
            language === "tr"
              ? "Davet linki geçersiz veya süresi dolmuş"
              : "Invalid or expired invitation link",
          );
        }
        userRole = validation.role || "user";
      }

      // Doğrudan Supabase Auth API ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: userRole,
            from_invitation: inviteToken ? "true" : "false", // Davet ile kayıt olduğunu belirt
          },
        },
      });

      // Hata durumunda daha detaylı bilgi göster
      if (authError) {
        console.log("Kayıt hatası detayları:", authError);
      }

      // Kullanıcı oluşturuldu
      if (!authError && authData?.user) {
        console.log("Kullanıcı oluşturuldu", authData.user);

        // Kullanıcıyı doğrulanmış olarak işaretle
        const { error: confirmError } = await supabase.auth.updateUser({
          data: { email_confirmed: true },
        });

        if (confirmError) {
          console.error("Kullanıcı doğrulama hatası:", confirmError);
        }

        // Kullanıcı tablosuna ekle
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          user_type: userRole,
          is_active: true,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Kullanıcı tablosuna ekleme hatası:", insertError);
        }
      }

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("User already registered");
        }
        throw authError;
      }

      if (!authData?.user?.id) throw new Error("User creation failed");

      // If using invitation, mark it as used
      if (inviteToken) {
        try {
          await markInvitationAsUsed(inviteToken, authData.user.id);
          console.log(
            `Davet başarıyla kullanıldı olarak işaretlendi. Token: ${inviteToken}`,
          );
        } catch (markError) {
          console.error(
            "Davet kullanıldı olarak işaretlenirken hata:",
            markError,
          );
          // Continue with registration even if marking invitation fails
        }
      }

      // Otomatik giriş yap
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        // Kullanıcı oturumunu yenile
        await supabase.auth.refreshSession();

        if (signInError) {
          console.error("Otomatik giriş hatası:", signInError);
          // Hata olsa bile devam et
        }
      } catch (signInError) {
        console.error("Otomatik giriş sırasında hata:", signInError);
        // Giriş hatası olsa bile kayıt başarılı sayılır
      }

      toast.success(
        language === "tr" ? "Kayıt başarılı!" : "Registration successful!",
        {
          description:
            language === "tr"
              ? "Hesabınız oluşturuldu. Giriş yapabilirsiniz."
              : "Your account has been created. You can now log in.",
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
        console.error("Registration error:", error);
        toast.error(
          language === "tr"
            ? "Kayıt sırasında bir hata oluştu: " + error.message
            : "An error occurred during registration: " + error.message,
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
          disabled={!!(inviteEmail || (inviteToken && formData.email !== ""))}
        />
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
