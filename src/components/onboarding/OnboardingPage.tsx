import { useState, useEffect } from "react";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { useSwipe } from "@/hooks/useSwipe";
import { Button } from "../ui/button";
import { Clock, BarChart2, Users, ArrowRight, Play, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const getSteps = (language: string): OnboardingStep[] => [
  {
    title: language === "tr" ? "Zaman Takibi" : "Track Your Time",
    description:
      language === "tr"
        ? "Projelerinizi ve görevlerinizi tek tıkla takip edin, zamanınızı verimli yönetin"
        : "Effortlessly track time spent on tasks and projects with our intuitive timer",
    icon: (
      <m.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          times: [0, 0.2, 0.8, 1],
          repeat: Infinity,
          repeatType: "reverse",
        }}
        whileHover={{ scale: 1.2 }}
        className="p-1 backdrop-blur-sm bg-foreground/5 rounded-lg"
      >
        <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
      </m.div>
    ),
    content: (
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Time Tracker</h3>
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-bold text-center py-6 sm:py-8">
                00:00:00
              </div>
              <Button className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-lg">
              <div className="text-sm text-muted-foreground">Today</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">2.5h</div>
            </div>
            <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-lg">
              <div className="text-sm text-muted-foreground">Tasks</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">3</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: language === "tr" ? "Detaylı Raporlar" : "Detailed Reports",
    description:
      language === "tr"
        ? "Zaman kullanımınızı analiz edin, verimlilik trendlerinizi görün"
        : "Analyze your time usage and see productivity trends with detailed reports",
    icon: (
      <m.div
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.5,
          ease: "easeOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        whileHover={{ scale: 1.2 }}
        className="p-1 backdrop-blur-sm bg-foreground/5 rounded-lg"
      >
        <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8" />
      </m.div>
    ),
    content: (
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Weekly Report</h3>
              </div>
              <div className="h-32 flex items-end gap-2">
                {[40, 65, 35, 85, 45, 55, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-t-lg transition-all duration-300 hover:opacity-90"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: language === "tr" ? "Takım Çalışması" : "Team Collaboration",
    description:
      language === "tr"
        ? "Ekibinizle birlikte çalışın, projeleri ve görevleri takip edin"
        : "Work together with your team, track projects and tasks collaboratively",
    icon: (
      <m.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          times: [0, 0.33, 0.66, 1],
          repeat: Infinity,
        }}
        whileHover={{ scale: 1.2 }}
        className="p-1 backdrop-blur-sm bg-foreground/5 rounded-lg"
      >
        <Users className="h-6 w-6 sm:h-8 sm:w-8" />
      </m.div>
    ),
    content: (
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Team Overview</h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "Design Team",
                    hours: 24.5,
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    name: "Development",
                    hours: 32.2,
                    color: "from-purple-500 to-purple-600",
                  },
                  {
                    name: "Marketing",
                    hours: 18.7,
                    color: "from-pink-500 to-pink-600",
                  },
                ].map((team) => (
                  <div key={team.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{team.name}</span>
                      <span className="font-mono">{team.hours}h</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${team.color} transition-all duration-300`}
                        style={{ width: `${(team.hours / 40) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function OnboardingPage() {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextStep();
      } else if (e.key === "ArrowLeft") {
        handlePrevStep();
      } else if (e.key === "Escape") {
        if (dontShowAgain) {
          localStorage.setItem("hasSeenOnboarding", "true");
        }
        setHasSeenOnboarding(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, dontShowAgain]);

  useSwipe({
    onSwipeLeft: handleNextStep,
    onSwipeRight: handlePrevStep,
    threshold: 50,
  });
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const steps = getSteps(language);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setHasSeenOnboarding(true);
      localStorage.setItem("hasSeenOnboarding", "true");
    }
  };

  if (hasSeenOnboarding) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden touch-none">
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left Side - Content */}
            <div className="relative z-10 space-y-6 sm:space-y-8 text-center md:text-left">
              <AnimatePresence mode="wait">
                <m.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl ring-2 ring-border/20">
                      {steps[currentStep].icon}
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
                      {steps[currentStep].description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                          style={{
                            width: `${((currentStep + 1) / steps.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {currentStep + 1}/{steps.length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                          onClick={handleNext}
                          className="w-full sm:w-auto flex-1 h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {currentStep < steps.length - 1 ? (
                            <>
                              {language === "tr" ? "İleri" : "Next"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : language === "tr" ? (
                            "Başla"
                          ) : (
                            "Get Started"
                          )}
                        </Button>

                        {currentStep < steps.length - 1 && (
                          <Button
                            variant="outline"
                            onClick={() => setHasSeenOnboarding(true)}
                            className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl"
                          >
                            {language === "tr" ? "Atla" : "Skip"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>

            {/* Right Side - Content */}
            <div className="hidden md:block relative">
              <AnimatePresence mode="wait">
                <m.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/20 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm"
                >
                  {steps[currentStep].content}
                </m.div>
              </AnimatePresence>

              {/* Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}

export default OnboardingPage;
