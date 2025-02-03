import { Moon, Sun, LogOut, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      navigate("/auth");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-lg border-b border-border z-50">
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">HelloDeveloper</h1>
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="hover:bg-primary/5 hover:text-primary"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">
                  Switch to {theme === "light" ? "dark" : "light"} mode
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/5 hover:text-primary"
                >
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">Settings</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-destructive/5 hover:text-destructive text-muted-foreground"
                >
                  <LogOut className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">Sign out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
