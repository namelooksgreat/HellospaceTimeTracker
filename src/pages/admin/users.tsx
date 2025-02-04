import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersTable } from "@/components/admin/UsersTable";
import { UserDialog } from "@/components/admin/dialogs/UserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: dbUsers, error: dbError } = await supabase
        .from("users")
        .select("*")
        .order("created_at");

      if (dbError) throw dbError;

      setUsers(
        dbUsers.map((user) => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name || "Unknown",
          role: user.role || "user",
          active: user.active !== false,
          last_login: user.last_sign_in_at,
        })),
      );
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load users",
      });
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingUser) {
        // Update user in auth if email changed
        if (data.email !== editingUser.email) {
          const { error: updateAuthError } =
            await supabase.auth.admin.updateUserById(editingUser.id, {
              email: data.email,
            });
          if (updateAuthError) throw updateAuthError;
        }

        // Update password if provided
        if (data.password) {
          const { error: updatePasswordError } =
            await supabase.auth.admin.updateUserById(editingUser.id, {
              password: data.password,
            });
          if (updatePasswordError) throw updatePasswordError;
        }

        // Update user in database
        const { error: dbUpdateError } = await supabase
          .from("users")
          .update({
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            active: data.active,
          })
          .eq("id", editingUser.id);

        if (dbUpdateError) throw dbUpdateError;
      } else {
        // Create new user in auth
        const { data: authData, error: createError } =
          await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.full_name,
              },
            },
          });

        if (createError) throw createError;
        if (!authData?.user) throw new Error("No user returned from signup");

        // Insert into users table
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            active: data.active,
          },
        ]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: `User ${editingUser ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not ${editingUser ? "update" : "create"} user`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete user",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <UsersTable
          users={users}
          onEdit={(user) => {
            setEditingUser(user);
            setDialogOpen(true);
          }}
          onDelete={handleDelete}
        />

        <UserDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingUser(null);
            }
            setDialogOpen(open);
          }}
          user={editingUser}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
}
