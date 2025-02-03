import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "../ui/button";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant={mode === "login" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("login")}
          >
            Login
          </Button>
          <Button
            variant={mode === "register" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("register")}
          >
            Register
          </Button>
        </div>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
