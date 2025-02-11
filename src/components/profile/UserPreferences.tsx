import { useTheme } from "../theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function UserPreferences() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <CardContent className="relative z-10 p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px] bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg">
                <SelectItem
                  value="light"
                  className="py-2.5 cursor-pointer focus:bg-accent/50"
                >
                  Light
                </SelectItem>
                <SelectItem
                  value="dark"
                  className="py-2.5 cursor-pointer focus:bg-accent/50"
                >
                  Dark
                </SelectItem>
                <SelectItem
                  value="system"
                  className="py-2.5 cursor-pointer focus:bg-accent/50"
                >
                  System
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your activity
              </p>
            </div>
            <Switch className="data-[state=checked]:bg-primary" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Time Format</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred time format
              </p>
            </div>
            <Select defaultValue="12h">
              <SelectTrigger className="w-[180px] bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg">
                <SelectItem
                  value="12h"
                  className="py-2.5 cursor-pointer focus:bg-accent/50"
                >
                  12-hour
                </SelectItem>
                <SelectItem
                  value="24h"
                  className="py-2.5 cursor-pointer focus:bg-accent/50"
                >
                  24-hour
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
