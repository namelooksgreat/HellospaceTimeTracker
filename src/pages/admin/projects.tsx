import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { ProjectDialog } from "@/components/admin/dialogs/ProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getProjects, getCustomers, createProject } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        { data: projectsData, error: projectsError },
        { data: customersData, error: customersError },
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("*, customer:customers(*)")
          .order("name"),
        supabase.from("customers").select("*").order("name"),
      ]);

      if (projectsError) throw projectsError;
      if (customersError) throw customersError;

      setProjects(projectsData || []);
      setCustomers(customersData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load data",
      });
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update({
            name: data.name,
            color: data.color,
            customer_id: data.customer_id,
          })
          .eq("id", editingProject.id);

        if (error) throw error;
      } else {
        await createProject(data);
      }

      toast({
        title: "Success",
        description: `Project ${editingProject ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not ${editingProject ? "update" : "create"} project`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete project",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        <ProjectsTable
          projects={projects}
          onEdit={(project) => {
            setEditingProject(project);
            setDialogOpen(true);
          }}
          onDelete={handleDelete}
        />

        <ProjectDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProject(null);
            }
            setDialogOpen(open);
          }}
          project={editingProject}
          customers={customers}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
}
