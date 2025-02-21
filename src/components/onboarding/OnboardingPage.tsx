import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1
                ? "Welcome to Time Tracker"
                : step === 2
                  ? "Track Your Time"
                  : "Stay Productive"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1
                ? "Let's get you started with time tracking"
                : step === 2
                  ? "Easily track time for your tasks and projects"
                  : "Get insights into your productivity"}
            </p>
          </motion.div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input type="text" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label>Your Role</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Developer, Designer, etc."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Project</Label>
                  <Input type="text" placeholder="e.g. Main Project" />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input type="number" placeholder="e.g. 8" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Daily Summary</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Weekly Reports</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <div className="space-x-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(i + 1)}
                  className={`w-2 h-2 p-0 rounded-full ${step === i + 1 ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <Button
              onClick={() => {
                if (step < totalSteps) {
                  setStep((prev) => prev + 1);
                } else {
                  handleComplete();
                }
              }}
            >
              {step === totalSteps ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
