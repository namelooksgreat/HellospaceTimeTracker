import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Get user's full name from metadata
      const fullName = data.user?.user_metadata?.full_name || data.user?.email;

      toast.success(`Welcome back${fullName ? `, ${fullName}` : ""}!`, {
        description: "You've successfully logged in",
      });
    } catch (error) {
      handleError(error, "LoginForm");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Enter your email address"
          required
          autoFocus
          autoComplete="email"
        />
        <p className="text-xs text-muted-foreground">
          We'll never share your email with anyone else.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Password</Label>
          <button
            type="button"
            onClick={async () => {
              try {
                if (!formData.email) {
                  toast.error("Please enter your email first");
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
                toast.success("Password reset email sent", {
                  description: "Check your email for the reset link",
                });
              } catch (error) {
                handleError(error, "LoginForm");
              } finally {
                setLoading(false);
              }
            }}
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
        <p className="text-xs text-muted-foreground">
          Enter your secure password to access your account.
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
        Giriş Yap
      </Button>
    </form>
  );
}
