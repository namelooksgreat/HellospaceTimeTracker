import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UserProfile } from "./UserProfile";
import { UserPreferences } from "./UserPreferences";
import { UserSecurity } from "./UserSecurity";
import { Settings, Shield, Palette } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden sm:rounded-lg rounded-none border-x-0 sm:border-x">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Settings className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              Account Settings
            </h1>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-10 p-1 bg-muted/50 rounded-lg grid grid-cols-3 gap-1">
            <TabsTrigger
              value="profile"
              className="h-9 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Settings className="h-4 w-4" />
                <span>Profile</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="h-9 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Palette className="h-4 w-4" />
                <span>Preferences</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="h-9 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
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
      </CardContent>
    </Card>
  );
}
