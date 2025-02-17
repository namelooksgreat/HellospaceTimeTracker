import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "./UserProfile";
import { UserActivity } from "./UserActivity";
import { UserSettings } from "./UserSettings";
import { UserSecurity } from "./UserSecurity";

export function UserDetailPage() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile" className="m-0">
              <UserProfile userId={userId} />
            </TabsContent>
            <TabsContent value="activity" className="m-0">
              <UserActivity userId={userId} />
            </TabsContent>
            <TabsContent value="settings" className="m-0">
              <UserSettings userId={userId} />
            </TabsContent>
            <TabsContent value="security" className="m-0">
              <UserSecurity userId={userId} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
