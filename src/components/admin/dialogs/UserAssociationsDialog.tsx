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

      // Load all customers and projects in parallel
      const [projectsResponse, customersResponse] = await Promise.all([
        supabase
          .from("projects")
          .select(
            `
            id,
            name,
            customer:customers(id, name)
          `,
          )
          .order("name"),
        supabase.from("customers").select("id, name").order("name"),
      ]);

      if (projectsResponse.error) throw projectsResponse.error;
      if (customersResponse.error) throw customersResponse.error;

      setProjects(
        (projectsResponse.data || []).map((p) => ({
          id: p.id,
          name: p.name,
        })),
      );
      setCustomers(customersResponse.data || []);

      // Load user's current project and customer associations in parallel
      const [userProjects, userCustomers] = await Promise.all([
        supabase
          .from("user_projects")
          .select("project_id")
          .eq("user_id", userId),
        supabase
          .from("user_customers")
          .select("customer_id")
          .eq("user_id", userId),
      ]);

      if (userProjects.error) throw userProjects.error;
      if (userCustomers.error) throw userCustomers.error;

      const projectIds = (userProjects.data || []).map(
        (item) => item.project_id,
      );
      const customerIds = (userCustomers.data || []).map(
        (item) => item.customer_id,
      );

      setSelectedProjects(projectIds);
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

      // Delete existing project and customer associations
      await Promise.all([
        supabase.from("user_projects").delete().eq("user_id", userId),
        supabase.from("user_customers").delete().eq("user_id", userId),
      ]);

      // Insert new project associations if any
      if (selectedProjects.length > 0) {
        const { data: validProjects, error: verifyError } = await supabase
          .from("projects")
          .select("id")
          .in("id", selectedProjects);

        if (verifyError) throw verifyError;

        const validProjectIds = (validProjects || []).map((p) => p.id);
        if (validProjectIds.length > 0) {
          const { error: insertProjectError } = await supabase
            .from("user_projects")
            .insert(
              validProjectIds.map((projectId) => ({
                user_id: userId,
                project_id: projectId,
                created_at: new Date().toISOString(),
              })),
            );

          if (insertProjectError) throw insertProjectError;
        }
      }

      // Insert new customer associations if any
      if (selectedCustomers.length > 0) {
        const { data: validCustomers, error: verifyError } = await supabase
          .from("customers")
          .select("id")
          .in("id", selectedCustomers);

        if (verifyError) throw verifyError;

        const validCustomerIds = (validCustomers || []).map((c) => c.id);
        if (validCustomerIds.length > 0) {
          const { error: insertCustomerError } = await supabase
            .from("user_customers")
            .insert(
              validCustomerIds.map((customerId) => ({
                user_id: userId,
                customer_id: customerId,
                created_at: new Date().toISOString(),
              })),
            );

          if (insertCustomerError) throw insertCustomerError;
        }
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
