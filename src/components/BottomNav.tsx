import { Timer, BarChart, Settings2, Play, Pause } from "lucide-react";
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
      icon: BarChart,
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
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 dark:bg-background/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom z-50">
      <motion.div
        className="container max-w-lg mx-auto flex justify-between items-center px-6 h-20 relative"
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
                isTimer ? "-mt-10 h-20 w-20" : "h-14 w-14",
                isTimer ? "rounded-2xl" : "rounded-xl",
                isActive && !isTimer && "bg-primary/10",
                isTimer && "bg-background shadow-2xl border border-border/50",
                "transition-all duration-500 ease-out-expo touch-none",
                !isTimer && "relative overflow-hidden",
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
                  <Avatar
                    className={cn(
                      "h-6 w-6 bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20 shadow-lg shadow-primary/10 overflow-hidden transition-all duration-300",
                      "group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20",
                      isActive &&
                        "scale-110 shadow-xl shadow-primary/20 ring-2 ring-primary/50 from-primary/30 to-primary/20",
                    )}
                  >
                    <AvatarImage
                      src={
                        user?.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                      }
                      className={cn(
                        "object-cover transition-transform duration-300",
                        "group-hover:scale-110",
                        isActive && "scale-110",
                      )}
                    />
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium text-primary bg-gradient-to-br from-primary/20 to-primary/10",
                        isActive && "from-primary/30 to-primary/20",
                      )}
                    >
                      {user?.full_name?.[0] || user?.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon
                    className={cn(
                      "relative h-6 w-6 transition-all duration-300",
                      "group-hover:scale-110",
                      isActive && "text-primary scale-110",
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                )}
              </motion.div>

              {isActive && !isTimer && (
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-xl"
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
