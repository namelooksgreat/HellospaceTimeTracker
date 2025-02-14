import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { supabase } from "@/lib/supabase";

interface UserAssociationsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function UserAssociationsDialog({
  userId,
  open,
  onOpenChange,
  onSave,
}: UserAssociationsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, userId]);

  const checkUserPermission = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("Not authenticated");

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User data not found");

    const hasPermission =
      userData.user_type === "admin" || userData.user_type === "developer";
    if (!hasPermission) {
      throw new Error(
        "Unauthorized: Only admins and developers can manage user associations",
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Check user permission first
      await checkUserPermission();

      // Load all projects with their customers
      const { data: projectsData, error: projectsError } = await supabase.from(
        "projects",
      ).select(`
          id,
          name,
          customer:customers!left(id, name)
        `);

      if (projectsError) throw projectsError;

      const projects = (projectsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        customer: p.customer?.[0],
      }));

      if (projectsError) throw projectsError;

      // Extract unique customers from projects
      const uniqueCustomers = Array.from(
        new Map(
          projects
            .filter((p) => p.customer)
            .map((p) => [
              p.customer.id,
              { id: p.customer.id, name: p.customer.name },
            ]),
        ).values(),
      );

      setProjects(projects.map((p) => ({ id: p.id, name: p.name })));
      setCustomers(uniqueCustomers);

      // Load user's current project associations
      const { data: userProjects, error: userProjectsError } = await supabase
        .from("user_projects")
        .select("project_id")
        .eq("user_id", userId);

      if (userProjectsError) throw userProjectsError;

      const projectIds = (userProjects || []).map((item) => item.project_id);
      setSelectedProjects(projectIds);

      // Get customer IDs from selected projects
      const customerIds = [
        ...new Set(
          projects
            .filter((p) => projectIds.includes(p.id))
            .filter((p) => p.customer)
            .map((p) => p.customer.id),
        ),
      ];
      setSelectedCustomers(customerIds);
    } catch (error) {
      handleError(error, "UserAssociationsDialog");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Check user permission before saving
      await checkUserPermission();

      // Delete existing associations
      const { error: deleteError } = await supabase
        .from("user_projects")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new associations if any
      if (selectedProjects.length > 0) {
        // Verify selected projects exist and are accessible
        const { data: validProjects, error: verifyError } = await supabase
          .from("projects")
          .select("id")
          .in("id", selectedProjects);

        if (verifyError) throw verifyError;

        const validProjectIds = (validProjects || []).map((p) => p.id);

        const { error: insertError } = await supabase
          .from("user_projects")
          .insert(
            validProjectIds.map((projectId) => ({
              user_id: userId,
              project_id: projectId,
              created_at: new Date().toISOString(),
            })),
          );

        if (insertError) throw insertError;
      }

      showSuccess("User associations updated successfully");
      onSave();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "UserAssociationsDialog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage User Associations</DialogTitle>
          <DialogDescription>
            Assign projects and customers to this user
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="projects" className="flex-1">
              Projects
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex-1">
              Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProjects((prev) => [...prev, project.id]);
                        } else {
                          setSelectedProjects((prev) =>
                            prev.filter((id) => id !== project.id),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`project-${project.id}`}>
                      {project.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="customers" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`customer-${customer.id}`}
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCustomers((prev) => [
                            ...prev,
                            customer.id,
                          ]);
                        } else {
                          setSelectedCustomers((prev) =>
                            prev.filter((id) => id !== customer.id),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`customer-${customer.id}`}>
                      {customer.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
