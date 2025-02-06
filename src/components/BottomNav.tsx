import { Timer, BarChart3, Settings2, Play, Pause } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";

type TabType = "timer" | "reports" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { user } = useAuth();
  const { state: timerState } = useTimerStore();
  const tabs: Array<{
    id: TabType;
    icon: typeof Timer;
    description: string;
  }> = [
    {
      id: "reports",
      icon: BarChart3,
      description: "View your statistics",
    },
    {
      id: "timer",
      icon: Timer,
      description: "Track your time",
    },
    {
      id: "profile",
      icon: Settings2,
      description: "Manage your account",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-background/70 backdrop-blur-2xl border-t border-border/50 safe-area-bottom z-50">
      <motion.div
        className="max-w-md mx-auto flex justify-between items-center px-8 h-16 relative"
        initial={false}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isTimer = tab.id === "timer";

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center justify-center outline-none",
                isTimer ? "-mt-8 h-20 w-20" : "h-12 w-12",
                isTimer ? "rounded-2xl" : "rounded-xl",
                isActive && !isTimer && "bg-primary/10",
                isTimer && "bg-background shadow-2xl border border-border/50",
                "transition-all duration-500 ease-out-expo touch-none",
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: isTimer ? 1.05 : 1.02 }}
            >
              <motion.div
                className={cn(
                  "relative z-10 transition-colors duration-500",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive && isTimer ? 360 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
              >
                {isTimer ? (
                  timerState === "running" ? (
                    <Pause
                      className="h-8 w-8 transition-all duration-500"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  ) : timerState === "paused" ? (
                    <Play
                      className="h-8 w-8 transition-all duration-500"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  ) : (
                    <Timer
                      className="h-8 w-8 transition-all duration-500"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  )
                ) : tab.id === "profile" ? (
                  <Avatar className="h-6 w-6 border border-border/50">
                    <AvatarImage
                      src={
                        user?.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                      }
                    />
                    <AvatarFallback className="text-xs">
                      {user?.full_name?.[0] || user?.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon
                    className={cn("transition-all duration-500", "h-6 w-6")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                )}
              </motion.div>

              {isActive && !isTimer && (
                <motion.div
                  className="absolute bottom-1.5 h-1 w-6 bg-primary rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}

              {isTimer && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

export default BottomNav;
