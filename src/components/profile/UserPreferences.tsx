import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Palette, Globe, Bell, Clock, Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/components/theme-provider";

export function UserPreferences() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [timeFormat, setTimeFormat] = useState("24h");

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <CardContent className="relative z-10 p-6 space-y-6">
        <div className="flex items-center gap-2 text-foreground">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Preferences</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Theme</span>
              </Label>
              <Select
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as "light" | "dark" | "system")
                }
              >
                <SelectTrigger className="w-[180px] h-9 bg-background/50 hover:bg-accent/50 transition-all duration-150">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Choose your preferred theme for the interface.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>Language</span>
              </Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as "en" | "tr")}
              >
                <SelectTrigger className="w-[180px] h-9 bg-background/50 hover:bg-accent/50 transition-all duration-150">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Choose your preferred language for the interface.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="email-notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Email Notifications</span>
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Receive email notifications about your activities.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="time-format" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Time Format</span>
              </Label>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger className="w-[180px] h-9 bg-background/50 hover:bg-accent/50 transition-all duration-150">
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Choose how time is displayed throughout the app.
            </div>
          </div>
        </div>

        <Button
          type="button"
          className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
