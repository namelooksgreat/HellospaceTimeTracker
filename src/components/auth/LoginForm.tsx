import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const fullName = data.user?.user_metadata?.full_name || data.user?.email;

      toast.success(
        language === "tr"
          ? `Hoş geldiniz${fullName ? `, ${fullName}` : ""}!`
          : `Welcome back${fullName ? `, ${fullName}` : ""}!`,
        {
          description:
            language === "tr"
              ? "Başarıyla giriş yaptınız"
              : "You've successfully logged in",
        },
      );
    } catch (error) {
      handleError(error, "LoginForm");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          autoFocus
          autoComplete="email"
        />
        <p className="text-xs text-muted-foreground">
          {language === "tr"
            ? "E-posta adresiniz kimseyle paylaşılmayacaktır."
            : "We'll never share your email with anyone else."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{language === "tr" ? "Şifre" : "Password"}</Label>
          <button
            type="button"
            onClick={async () => {
              try {
                if (!formData.email) {
                  toast.error(
                    language === "tr"
                      ? "Lütfen önce e-posta adresinizi girin"
                      : "Please enter your email first",
                  );
                  return;
                }
                setLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(
                  formData.email,
                  {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                  },
                );
                if (error) throw error;
                toast.success(
                  language === "tr"
                    ? "Şifre sıfırlama e-postası gönderildi"
                    : "Password reset email sent",
                  {
                    description:
                      language === "tr"
                        ? "Sıfırlama bağlantısı için e-postanızı kontrol edin"
                        : "Check your email for the reset link",
                  },
                );
              } catch (error) {
                handleError(error, "LoginForm");
              } finally {
                setLoading(false);
              }
            }}
            className="text-xs text-primary hover:underline"
          >
            {language === "tr" ? "Şifremi unuttum" : "Forgot password?"}
          </button>
        </div>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder={
            language === "tr" ? "Şifrenizi girin" : "Enter your password"
          }
          required
          autoComplete="current-password"
        />
        <p className="text-xs text-muted-foreground">
          {language === "tr"
            ? "Hesabınıza erişmek için güvenli şifrenizi girin."
            : "Enter your secure password to access your account."}
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
          <LogIn className="mr-2 h-4 w-4" />
        )}
        {language === "tr" ? "Giriş Yap" : "Sign In"}
      </Button>
    </form>
  );
}
