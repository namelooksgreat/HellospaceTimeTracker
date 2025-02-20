import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UserProfile } from "./UserProfile";
import { UserPreferences } from "./UserPreferences";
import { UserSecurity } from "./UserSecurity";
import { Settings, Shield, Palette } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-background/50 text-foreground ring-1 ring-border/50 transition-colors duration-200">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Account Settings
          </h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-14 p-1.5 bg-muted/50 dark:bg-muted/30 rounded-xl ring-1 ring-border transition-all duration-300 ease-in-out grid grid-cols-3 gap-1">
          <TabsTrigger
            value="profile"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span>Profile</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Palette className="h-4 w-4" />
              <span>Preferences</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent
            value="profile"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <UserProfile user={user} />
          </TabsContent>
          <TabsContent
            value="preferences"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <UserPreferences />
          </TabsContent>
          <TabsContent
            value="security"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <UserSecurity />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
