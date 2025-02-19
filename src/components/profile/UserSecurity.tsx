import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";

export function UserSecurity({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (formData.newPassword !== formData.confirmPassword) {
      handleError(new Error("Passwords do not match"), "UserSecurity");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      showSuccess("Password updated successfully");
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-black/80 dark:via-black/60 dark:to-black/40 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            Security Settings
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
