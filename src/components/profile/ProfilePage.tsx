import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UserProfile } from "./UserProfile";
import { UserPreferences } from "./UserPreferences";
import { UserSecurity } from "./UserSecurity";
import { Settings, Shield, Palette, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { showSuccess } from "@/lib/utils/toast";

export function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="p-6 flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Account Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full h-10 p-1 bg-muted/50 rounded-lg">
              <TabsTrigger
                value="profile"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Preferences</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              <TabsContent value="profile">
                <UserProfile user={user} />
              </TabsContent>
              <TabsContent value="preferences">
                <UserPreferences />
              </TabsContent>
              <TabsContent value="security">
                <UserSecurity />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
