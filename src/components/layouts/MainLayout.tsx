import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "../ui/button";
import { Clock, BarChart2, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";
import { lightHapticFeedback } from "@/lib/utils/haptics";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: "timer" | "reports" | "profile") => void;
}

export function MainLayout({
  children,
  activeTab = "timer",
  onTabChange,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);
  const isAdmin = session?.user?.user_metadata?.user_type === "admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tab: "timer" | "reports" | "profile") => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleAdminNavigation = () => {
    lightHapticFeedback();
    navigate("/admin");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-background via-background/95 to-background/90">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/hellospace-tracker-black.png"
                alt="Hellospace Tracker"
                className="h-8 w-auto block dark:hidden"
              />
              <img
                src="/hellospace-tracker-white.png"
                alt="Hellospace Tracker"
                className="h-8 w-auto hidden dark:block"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-lg px-3 text-muted-foreground",
                  activeTab === "reports" && "bg-muted/50 text-foreground",
                )}
                onClick={() => handleTabChange("reports")}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Reports
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-lg px-3 text-muted-foreground",
                  activeTab === "timer" && "bg-muted/50 text-foreground",
                )}
                onClick={() => handleTabChange("timer")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Timer
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-lg px-3 text-muted-foreground",
                  activeTab === "profile" && "bg-muted/50 text-foreground",
                )}
                onClick={() => handleTabChange("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminNavigation}
                  className="hidden sm:flex h-8 rounded-lg"
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>

      <nav className="sticky bottom-0 z-50 sm:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleTabChange("reports")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-xl",
              activeTab === "reports"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground",
            )}
          >
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs font-medium">Reports</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleTabChange("timer")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-xl",
              activeTab === "timer"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground",
            )}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium">Timer</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleTabChange("profile")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-xl",
              activeTab === "profile"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground",
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAdminNavigation}
              className="flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-xl text-muted-foreground"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Admin</span>
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}
