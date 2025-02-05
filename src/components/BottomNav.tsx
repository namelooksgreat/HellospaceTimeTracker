import { Timer, BarChart2, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type TabType = "timer" | "reports" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: Array<{
    id: TabType;
    icon: typeof Timer;
    label: string;
    description: string;
  }> = [
    {
      id: "reports",
      icon: BarChart2,
      label: "Reports",
      description: "View your statistics",
    },
    {
      id: "timer",
      icon: Timer,
      label: "Timer",
      description: "Track your time",
    },
    {
      id: "profile",
      icon: UserCircle,
      label: "Profile",
      description: "Manage your account",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 dark:bg-background/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom z-50 h-[4.5rem]">
      <div className="max-w-md mx-auto flex justify-between items-center px-6 py-2 relative">
        <TooltipProvider>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isTimer = tab.id === "timer";

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => onTabChange(tab.id)}
                    className={`
                      relative flex flex-col items-center justify-center
                      ${isTimer ? "min-w-[96px] -mt-8" : "min-w-[72px]"}
                      h-auto py-2 px-1 gap-1.5
                      transition-all duration-500 ease-out
                      ${
                        isActive
                          ? `text-primary bg-primary/10 shadow-lg shadow-primary/10 
                         ${isTimer ? "scale-110" : "scale-105"}`
                          : `text-muted-foreground hover:text-primary hover:bg-primary/5
                         ${isTimer ? "hover:scale-105" : "hover:scale-102"}`
                      }
                      ${isTimer ? "rounded-2xl border border-border/50 bg-background/80" : ""}
                    `}
                  >
                    <div className="relative">
                      <Icon
                        className={`transition-all duration-500
                          ${isTimer ? "h-6 w-6" : "h-5 w-5"}
                          ${isActive ? "scale-110 text-primary" : ""}
                          ${isTimer && !isActive ? "animate-bounce-subtle" : ""}
                        `}
                      />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 rounded-full overflow-hidden">
                        {isActive && (
                          <div className="w-full h-full bg-primary animate-slide-out-up" />
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium transition-all duration-300
                      ${isActive ? "font-semibold" : ""}
                      ${isTimer ? "text-sm" : ""}
                    `}
                    >
                      {tab.label}
                    </span>
                    {isTimer && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="font-medium bg-popover/95 backdrop-blur-sm border-border/50 shadow-xl"
                >
                  {tab.description}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}

export default BottomNav;
