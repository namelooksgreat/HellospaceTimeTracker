import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login } from "@/lib/auth";
import { showSuccess } from "@/lib/utils/toast";
import { handleError } from "@/lib/utils/error-handler";
import { AuthError } from "@/config/errors";
import { ERROR_MESSAGES, VALIDATION_RULES } from "@/config/errors";
import { MESSAGES } from "@/config/messages";

export function LoginForm() {
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    return {
      email: savedEmail || "",
      password: "",
    };
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberedEmail") !== null;
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Email");
      isValid = false;
      emailInputRef.current?.focus();
      return false;
    } else if (!VALIDATION_RULES.EMAIL.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.VALIDATION.INVALID_EMAIL;
      isValid = false;
      emailInputRef.current?.focus();
      return false;
    }

    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Password");
      isValid = false;
      passwordInputRef.current?.focus();
      return false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await login({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw new AuthError(error.message);
      if (!data?.session) throw new AuthError(ERROR_MESSAGES.AUTH.LOGIN_FAILED);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      showSuccess(MESSAGES.AUTH.LOGIN_SUCCESS);
      navigate("/");
    } catch (error) {
      handleError(error, "LoginForm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailInputRef}
            id="email"
            type="email"
            placeholder="E-posta adresiniz"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`bg-background ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p className="text-sm text-destructive" id="email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Parola</Label>
          <Input
            ref={passwordInputRef}
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, password: e.target.value }));
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`bg-background ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p className="text-sm text-destructive" id="password-error">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="h-5 w-5 rounded-md border-border/50 bg-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200"
            />
            <label
              htmlFor="remember"
              className="text-sm text-muted-foreground hover:text-foreground select-none transition-colors duration-200 cursor-pointer"
            >
              Beni hatırla
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/90 hover:underline transition-colors duration-200"
            onClick={() => {}}
          >
            Parolamı unuttum
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          variant="default"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </div>
  );
}
