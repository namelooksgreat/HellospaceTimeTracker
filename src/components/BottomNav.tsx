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
      id: "timer",
      icon: Timer,
      label: "Timer",
      description: "Track your time",
    },
    {
      id: "reports",
      icon: BarChart2,
      label: "Reports",
      description: "View your statistics",
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
      <div className="max-w-md mx-auto flex justify-between items-center px-6 py-2">
        <TooltipProvider>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center justify-center min-w-[72px] h-auto py-2 px-1 gap-1 ${
                      activeTab === tab.id
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    } transition-all duration-200`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {activeTab === tab.id && (
                        <span className="absolute -bottom-3 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{tab.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="font-medium">
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
