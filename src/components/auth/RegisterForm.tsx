import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { register } from "@/lib/auth";

export function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic validation
      if (!formData.email || !formData.password || !formData.full_name) {
        throw new Error("All fields are required");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const { user, error } = await register(formData);

      if (error) {
        if (error.message?.toLowerCase().includes("already registered")) {
          throw new Error("This email is already registered");
        }
        throw error;
      }

      if (!user) {
        throw new Error("Registration failed - please try again");
      }

      // Show success message
      setError("");
      alert("Registration successful! You can now log in.");
      navigate("/auth");
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 bg-card">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, full_name: e.target.value }))
            }
            required
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            className="bg-background"
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          variant="default"
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
