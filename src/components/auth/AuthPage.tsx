import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "../ui/button";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block p-2.5 rounded-xl bg-primary/10 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M12 2v10M12 16v6M12 12l8.5-8.5M12 12l-8.5-8.5" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hellospace Tracker
            </h1>
            <p className="text-muted-foreground">
              Zamanınızı etkili bir şekilde yönetin
            </p>
          </div>

          <div className="relative bg-card rounded-2xl p-4 sm:p-6 shadow-xl border border-border/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />

            <div className="relative space-y-6">
              <div className="flex p-1 gap-1 bg-muted/50 rounded-lg">
                <Button
                  variant={mode === "login" ? "default" : "ghost"}
                  className="flex-1 font-medium rounded-md"
                  onClick={() => setMode("login")}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant={mode === "register" ? "default" : "ghost"}
                  className="flex-1 font-medium rounded-md"
                  onClick={() => setMode("register")}
                >
                  Kayıt Ol
                </Button>
              </div>

              <AnimatePresence mode="wait">
                <m.div
                  key={mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {mode === "login" ? <LoginForm /> : <RegisterForm />}
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Henüz hesabınız yok mu?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary hover:underline font-medium"
                >
                  Kayıt olun
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Giriş yapın
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </LazyMotion>
  );
}
