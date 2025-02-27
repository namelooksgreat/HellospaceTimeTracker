import React, { useState, useEffect, Suspense } from "react";
import { ClientOnly } from "../ClientOnly";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";

const LoginForm = React.lazy(() =>
  import("./LoginForm").then((mod) => ({ default: mod.LoginForm })),
);
const RegisterForm = React.lazy(() =>
  import("./RegisterForm").then((mod) => ({ default: mod.RegisterForm })),
);
const OnboardingPage = React.lazy(() => import("../onboarding/OnboardingPage"));

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");
  const inviteEmail = searchParams.get("email");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    return !hasSeenOnboarding;
  });

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (hasSeenOnboarding) {
      setShowOnboarding(false);
    }

    // Handle URL routing for invitation links
    if (inviteToken) {
      console.log("Invitation token detected in URL:", inviteToken);
      console.log("Email from URL:", inviteEmail);

      // Make sure we're showing the register form
      setMode("register");

      // Fix the URL to avoid 401 errors with the token in the URL
      // Store token and email in sessionStorage instead
      if (inviteToken) {
        sessionStorage.setItem("inviteToken", inviteToken);
        if (inviteEmail) {
          sessionStorage.setItem("inviteEmail", inviteEmail);
        }

        // Navigate to clean URL without query parameters
        navigate("/auth", { replace: true });
      }
    } else {
      // Check if we have stored invitation data
      const storedToken = sessionStorage.getItem("inviteToken");
      const storedEmail = sessionStorage.getItem("inviteEmail");

      if (storedToken) {
        console.log("Using stored invitation token from session storage");
        setMode("register");
      }
    }
  }, [inviteToken, inviteEmail, navigate]);

  // If there's an invite token, always show register form
  const [mode, setMode] = useState<"login" | "register">(
    inviteToken ? "register" : "login",
  );

  return (
    <>
      {showOnboarding && !inviteToken && (
        <Suspense fallback={null}>
          <OnboardingPage />
        </Suspense>
      )}
      <ClientOnly>
        <Suspense fallback={null}>
          <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-background via-background/95 to-background/90">
            <div className="w-full max-w-md space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <motion.div
                  className="inline-block mb-2 relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="relative z-10"
                    animate={{
                      rotate: [-8, 0, 8, 0, -8],
                      x: [-3, 3, -3, 3, -3],
                      y: [-2, 0, -2, 0, -2],
                      scale: [1, 1.05, 1, 1.05, 1],
                      filter: [
                        "drop-shadow(0 0 0px rgba(var(--primary), 0.3))",
                        "drop-shadow(0 0 20px rgba(var(--primary), 0.8))",
                        "drop-shadow(0 0 0px rgba(var(--primary), 0.3))",
                      ],
                    }}
                    transition={{
                      rotate: {
                        repeat: Infinity,
                        duration: 0.2,
                        repeatDelay: 2,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                      },
                      x: {
                        repeat: Infinity,
                        duration: 0.2,
                        repeatDelay: 2,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                      },
                      y: {
                        repeat: Infinity,
                        duration: 0.2,
                        repeatDelay: 2,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                      },
                      scale: {
                        repeat: Infinity,
                        duration: 0.2,
                        repeatDelay: 2,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                      },
                      filter: {
                        repeat: Infinity,
                        duration: 0.8,
                        repeatDelay: 1.2,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <img
                      src="/hellospace-tracker-black.png"
                      alt="Hellospace Tracker"
                      className="h-16 sm:h-20 w-auto block dark:hidden relative z-10"
                    />
                    <img
                      src="/hellospace-tracker-white.png"
                      alt="Hellospace Tracker"
                      className="h-16 sm:h-20 w-auto hidden dark:block relative z-10"
                    />
                  </motion.div>
                </motion.div>
                <p className="text-sm text-muted-foreground text-center">
                  {inviteToken
                    ? "Complete your registration"
                    : "Join the Global Productivity Community"}
                </p>
              </div>

              <motion.div
                className="relative bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border/80 group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
                <div className="absolute inset-0 bg-grid-white/[0.02]" />

                <div className="relative space-y-6">
                  {/* Kayıt ol seçeneği kaldırıldı, sadece giriş yapma seçeneği var */}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <Suspense fallback={null}>
                        {inviteToken ||
                        sessionStorage.getItem("inviteToken") ? (
                          <RegisterForm
                            inviteToken={
                              inviteToken ||
                              sessionStorage.getItem("inviteToken")
                            }
                            inviteEmail={
                              inviteEmail ||
                              sessionStorage.getItem("inviteEmail")
                            }
                          />
                        ) : (
                          <LoginForm />
                        )}
                      </Suspense>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              {!inviteToken && !sessionStorage.getItem("inviteToken") && (
                <div className="space-y-2 text-center">
                  <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.5,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    Hesap oluşturmak için yöneticinizle iletişime geçin.
                  </motion.p>
                  <button
                    onClick={() => {
                      localStorage.removeItem("hasSeenOnboarding");
                      setShowOnboarding(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Tanıtım turunu tekrar görüntüle
                  </button>
                </div>
              )}
            </div>
          </div>
        </Suspense>
      </ClientOnly>
    </>
  );
}
