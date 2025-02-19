import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "../ui/button";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block mb-2">
              <img
                src="/hellospace-tracker-black.png"
                alt="Hellospace Tracker"
                className="h-12 sm:h-16 w-auto block dark:hidden"
              />
              <img
                src="/hellospace-tracker-white.png"
                alt="Hellospace Tracker"
                className="h-12 sm:h-16 w-auto hidden dark:block"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hellospace Tracker
            </h1>
            <p className="text-muted-foreground">
              Zamanınızı etkili bir şekilde yönetin
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            <div className="relative space-y-6">
              <div className="flex p-1 gap-1 bg-muted/50 rounded-xl">
                <Button
                  variant={mode === "login" ? "default" : "ghost"}
                  className="flex-1 font-medium rounded-lg transition-all duration-300"
                  onClick={() => setMode("login")}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant={mode === "register" ? "default" : "ghost"}
                  className="flex-1 font-medium rounded-lg transition-all duration-300"
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
