import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;

      // Create user record in users table
      if (data.user) {
        const { error: userError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            user_type: "user",
            created_at: new Date().toISOString(),
          },
        ]);

        if (userError) throw userError;
      }
    } catch (error) {
      handleError(error, "RegisterForm");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          value={formData.fullName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
          }
          placeholder="Enter your full name"
          required
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed on your profile.
        </p>
      </div>

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
        />
        <p className="text-xs text-muted-foreground">
          You'll use this email to log in to your account.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="Choose a secure password"
          required
        />
        <p className="text-xs text-muted-foreground">
          Use at least 8 characters with a mix of letters, numbers & symbols.
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
        Kayıt Ol
      </Button>
    </form>
  );
}
