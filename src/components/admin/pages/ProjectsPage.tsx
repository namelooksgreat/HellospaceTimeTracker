import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { AdminTable } from "../components/AdminTable";
import { AdminCard } from "../components/AdminCard";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Clock, Users, Trash2, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectDialog } from "../dialogs/ProjectDialog";
import { ProjectTagsDialog } from "../dialogs/ProjectTagsDialog";
import { useAdminUI } from "@/hooks/useAdminUI";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  color: string;
  customer_id: string;
  created_at: string;
  customer?: {
    id: string;
    name: string;
  };
  user_count?: number;
  time_entries_count?: number;
  total_duration?: number;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState("name_asc");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [projectTagsDialog, setProjectTagsDialog] = useState<{
    open: boolean;
    projectId: string;
    projectName: string;
  }>({ open: false, projectId: "", projectName: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();

  const loadProjects = async () => {
    await handleAsync(
      async () => {
        const { data, error } = await supabase.from("projects").select(`
            *,
            customer:customers(id, name),
            users:user_projects(*),
            time_entries(*)
          `);

        if (error) throw error;

        const transformedData = (data || []).map((project) => ({
          ...project,
          user_count: Array.isArray(project.users) ? project.users.length : 0,
          time_entries_count: Array.isArray(project.time_entries)
            ? project.time_entries.length
            : 0,
          total_duration: Array.isArray(project.time_entries)
            ? project.time_entries.reduce(
                (sum: number, entry: any) => sum + (entry.duration || 0),
                0,
              )
            : 0,
        }));

        setProjects(transformedData);
        filterAndSortProjects(
          transformedData,
          searchQuery,
          sortBy,
          customerFilter,
        );
      },
      {
        loadingMessage: "Loading projects...",
        errorMessage: "Failed to load projects",
      },
    );
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filterAndSortProjects = (
    data: Project[],
    query: string,
    sort: string,
    customer: string,
  ) => {
    let filtered = data.filter(
      (project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) &&
        (customer === "all" || project.customer_id === customer),
    );

    filtered.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "duration_asc":
          return (a.total_duration || 0) - (b.total_duration || 0);
        case "duration_desc":
          return (b.total_duration || 0) - (a.total_duration || 0);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  useEffect(() => {
    filterAndSortProjects(projects, searchQuery, sortBy, customerFilter);
  }, [projects, searchQuery, sortBy, customerFilter]);

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load projects"
        description={error.message}
        onRetry={() => {
          clearError();
          loadProjects();
        }}
      />
    );
  }

  const totalDuration = projects.reduce(
    (sum, project) => sum + (project.total_duration || 0),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard
          icon={<FolderKanban className="h-5 w-5 text-primary" />}
          title="Total Projects"
          value={projects.length}
          description={`${projects.filter((p) => p.time_entries_count && p.time_entries_count > 0).length} active`}
        />

        <AdminCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          title="Total Time Tracked"
          value={formatDuration(totalDuration)}
          description="Across all projects"
        />

        <AdminCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Total Users"
          value={projects.reduce((sum, p) => sum + (p.user_count || 0), 0)}
          description="Project assignments"
        />
      </div>

      <AdminHeader
        title="Projects"
        description="Manage your project portfolio"
        viewMode={{
          current: viewMode,
          onChange: setViewMode,
        }}
        actions={
          <Button onClick={() => setShowProjectDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        }
      />

      <AdminFilters
        searchProps={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search projects...",
        }}
        selectedCount={selectedProjects.length}
        bulkActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        }
      >
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {Array.from(
              new Map(
                projects
                  .filter((p) => p.customer)
                  .map((p) => [p.customer?.id, p.customer]),
              ).values(),
            ).map((customer) => (
              <SelectItem key={customer?.id} value={customer?.id || ""}>
                {customer?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="duration_asc">Duration (Low-High)</SelectItem>
            <SelectItem value="duration_desc">Duration (High-Low)</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>

      <AdminTable
        data={paginatedProjects}
        columns={[
          {
            header: "Select",
            cell: (project) => (
              <Checkbox
                checked={selectedProjects.includes(project.id)}
                onCheckedChange={(checked) => {
                  setSelectedProjects((prev) =>
                    checked
                      ? [...prev, project.id]
                      : prev.filter((id) => id !== project.id),
                  );
                }}
              />
            ),
          },
          {
            header: "Project",
            cell: (project) => (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg ring-2 ring-primary/20 flex items-center justify-center"
                  style={{ backgroundColor: project.color }}
                >
                  <span className="text-lg font-semibold text-white">
                    {project.name[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{project.name}</div>
                  {project.customer && (
                    <div className="text-sm text-muted-foreground">
                      {project.customer.name}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
          {
            header: "Time Tracked",
            cell: (project) => formatDuration(project.total_duration || 0),
          },
          {
            header: "Users",
            cell: (project) => project.user_count,
          },
          {
            header: "Time Entries",
            cell: (project) => project.time_entries_count,
          },
          {
            header: "Actions",
            cell: (project) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectDialog(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setProjectTagsDialog({
                      open: true,
                      projectId: project.id,
                      projectName: project.name,
                    })
                  }
                  className="admin-button"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Etiketler
                </Button>
              </div>
            ),
          },
        ]}
        loading={isLoading}
      />

      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredProjects.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <ProjectDialog
        project={selectedProject ? { ...selectedProject, user_id: "" } : null}
        open={showProjectDialog}
        onOpenChange={(open) => {
          setShowProjectDialog(open);
          if (!open) setSelectedProject(null);
        }}
        onSave={loadProjects}
      />

      <ProjectTagsDialog
        open={projectTagsDialog.open}
        onOpenChange={(open) =>
          setProjectTagsDialog({ ...projectTagsDialog, open })
        }
        projectId={projectTagsDialog.projectId}
        projectName={projectTagsDialog.projectName}
      />
    </div>
  );
}
