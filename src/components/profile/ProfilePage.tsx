import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card } from "../ui/card";
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
    <div className="container max-w-4xl mx-auto px-4 space-y-6">
      <Card className="bg-background/50 backdrop-blur-sm border-border/50 overflow-hidden rounded-none sm:rounded-xl shadow-none sm:shadow-lg transition-all duration-300 -mx-4 sm:mx-0">
        {/* Header - Fixed on mobile */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Account Settings
            </h1>
          </div>
        </div>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs List */}
          <div className="px-4 sm:px-6 pb-2 border-b border-border/50">
            <TabsList className="w-full h-11 p-1 bg-muted/50 rounded-lg grid grid-cols-3 gap-1">
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
          </div>

          {/* Tabs Content */}
          <div className="p-4 sm:p-6 space-y-6">
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
      </Card>
    </div>
  );
}
