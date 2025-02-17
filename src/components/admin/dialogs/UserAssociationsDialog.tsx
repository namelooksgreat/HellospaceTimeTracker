import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { supabase } from "@/lib/supabase";
import { LoadingState } from "@/components/ui/loading-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/types";

interface UserAssociationsDialogProps {
  user: {
    id: string;
    email: string;
    full_name?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

interface Customer {
  id: string;
  name: string;
}

export function UserAssociationsDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: UserAssociationsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  useEffect(() => {
    if (open && user?.id) {
      loadData();
    }
  }, [open, user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load all projects and customers
      const [projectsResponse, customersResponse] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, color, customer_id, customer:customers(id, name)")
          .order("name"),
        supabase.from("customers").select("id, name").order("name"),
      ]);

      if (projectsResponse.error) throw projectsResponse.error;
      if (customersResponse.error) throw customersResponse.error;

      // Load user's current associations
      const [userProjectsResponse, userCustomersResponse] = await Promise.all([
        supabase
          .from("user_projects")
          .select("project_id")
          .eq("user_id", user.id),
        supabase
          .from("user_customers")
          .select("customer_id")
          .eq("user_id", user.id),
      ]);

      if (userProjectsResponse.error) throw userProjectsResponse.error;
      if (userCustomersResponse.error) throw userCustomersResponse.error;

      const transformedProjects = (projectsResponse.data || []).map(
        (project: any) => {
          return {
            id: project.id,
            name: project.name,
            color: project.color,
            customer_id: project.customer_id,
            user_id: user.id,
            created_at: new Date().toISOString(),
            customer: project.customer
              ? {
                  id: project.customer.id,
                  name: project.customer.name,
                }
              : undefined,
          };
        },
      );

      setProjects(transformedProjects);
      setCustomers(customersResponse.data || []);
      setSelectedProjects(
        (userProjectsResponse.data || []).map((up) => up.project_id),
      );
      setSelectedCustomers(
        (userCustomersResponse.data || []).map((uc) => uc.customer_id),
      );
    } catch (error) {
      handleError(error, "UserAssociationsDialog");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Update project associations
      await supabase.from("user_projects").delete().eq("user_id", user.id);
      if (selectedProjects.length > 0) {
        await supabase.from("user_projects").insert(
          selectedProjects.map((projectId) => ({
            user_id: user.id,
            project_id: projectId,
          })),
        );
      }

      // Update customer associations
      await supabase.from("user_customers").delete().eq("user_id", user.id);
      if (selectedCustomers.length > 0) {
        await supabase.from("user_customers").insert(
          selectedCustomers.map((customerId) => ({
            user_id: user.id,
            customer_id: customerId,
          })),
        );
      }

      showSuccess("İlişkiler başarıyla güncellendi");
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
          <DialogTitle>
            {user?.full_name || user?.email} - İlişki Yönetimi
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingState
            title="Yükleniyor"
            description="İlişkiler yükleniyor..."
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Müşteriler</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
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
                          setSelectedCustomers((prev) =>
                            checked
                              ? [...prev, customer.id]
                              : prev.filter((id) => id !== customer.id),
                          );
                        }}
                      />
                      <label
                        htmlFor={`customer-${customer.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {customer.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Projeler</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={(checked) => {
                          setSelectedProjects((prev) =>
                            checked
                              ? [...prev, project.id]
                              : prev.filter((id) => id !== project.id),
                          );
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full ring-1 ring-border/50"
                          style={{ backgroundColor: project.color }}
                        />
                        <label
                          htmlFor={`project-${project.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {project.name}
                          {project.customer && (
                            <span className="text-muted-foreground">
                              {" "}
                              ({project.customer.name})
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-[100px]"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="w-[100px]"
                disabled={loading}
              >
                Kaydet
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
