import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { Card } from "@/components/ui/card";

interface UserProfileProps {
  userId?: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!userId) return;

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        handleError(error, "UserProfile");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">User Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <div>{userData.email}</div>
        </div>
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <div>{userData.full_name || "-"}</div>
        </div>
      </div>
    </Card>
  );
}
