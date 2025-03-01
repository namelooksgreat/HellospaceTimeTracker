import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { AdminTable } from "../components/AdminTable";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Trash2, Edit, BarChart2 } from "lucide-react";
import { ProjectTagsDialog } from "../dialogs/ProjectTagsDialog";
import { useAdminUI } from "@/hooks/useAdminUI";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
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
  customer_name: string;
  tag_count: number;
}

export function ProjectTagsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();

  const loadProjects = async () => {
    await handleAsync(
      async () => {
        // First get all customers for filtering
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, name")
          .order("name");

        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // Then get projects with tag counts
        const { data, error } = await supabase.rpc(
          "get_projects_with_tag_counts",
        );

        if (error) {
          // If the RPC function doesn't exist, fall back to a regular query
          console.warn("RPC function not available, using fallback query");
          const { data: projectsData, error: projectsError } =
            await supabase.from("projects").select(`
              *,
              customers(id, name),
              project_tags(count)
            `);

          if (projectsError) throw projectsError;

          const transformedData = (projectsData || []).map((project) => ({
            id: project.id,
            name: project.name,
            color: project.color,
            customer_id: project.customer_id,
            customer_name: project.customers?.name || "Unknown",
            tag_count: project.project_tags?.length || 0,
          }));

          setProjects(transformedData);
          filterAndSortProjects(
            transformedData,
            searchQuery,
            sortBy,
            customerFilter,
          );
          return;
        }

        // If RPC function exists, use its data
        const transformedData = (data || []).map((project: any) => ({
          id: project.project_id,
          name: project.project_name,
          color: project.project_color,
          customer_id: project.customer_id,
          customer_name: project.customer_name || "Unknown",
          tag_count: project.tag_count || 0,
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
    customerFilter: string,
  ) => {
    let filtered = data.filter(
      (project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) &&
        (customerFilter === "all" || project.customer_id === customerFilter),
    );

    filtered.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "customer_asc":
          return a.customer_name.localeCompare(b.customer_name);
        case "customer_desc":
          return b.customer_name.localeCompare(a.customer_name);
        case "tags_asc":
          return a.tag_count - b.tag_count;
        case "tags_desc":
          return b.tag_count - a.tag_count;
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

  const totalTags = projects.reduce(
    (sum, project) => sum + project.tag_count,
    0,
  );

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

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Tag className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium">Toplam Etiket</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                {totalTags}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tüm projelerdeki etiketler
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <BarChart2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium">Ortalama Etiket</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                {projects.length > 0
                  ? (totalTags / projects.length).toFixed(1)
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Proje başına düşen etiket sayısı
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Plus className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium">Toplam Proje</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                {projects.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Etiket eklenebilecek projeler
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminHeader
        title="Proje Etiketleri"
        description="Projelere ait etiketleri yönetin"
      />

      <AdminFilters
        searchProps={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Proje ara...",
        }}
        selectedCount={selectedProjects.length}
      >
        <div className="flex gap-2">
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Müşteri filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Müşteriler</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Proje Adı (A-Z)</SelectItem>
              <SelectItem value="name_desc">Proje Adı (Z-A)</SelectItem>
              <SelectItem value="customer_asc">Müşteri (A-Z)</SelectItem>
              <SelectItem value="customer_desc">Müşteri (Z-A)</SelectItem>
              <SelectItem value="tags_asc">Etiket Sayısı (Az-Çok)</SelectItem>
              <SelectItem value="tags_desc">Etiket Sayısı (Çok-Az)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminFilters>

      <AdminTable
        data={paginatedProjects}
        columns={[
          {
            header: "Proje",
            cell: (project) => (
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full ring-1 ring-border/50"
                  style={{ backgroundColor: project.color }}
                />
                <div className="font-medium">{project.name}</div>
              </div>
            ),
          },
          {
            header: "Müşteri",
            cell: (project) => project.customer_name,
          },
          {
            header: "Etiket Sayısı",
            cell: (project) => (
              <Badge variant="outline" className="bg-primary/5">
                {project.tag_count}
              </Badge>
            ),
          },
          {
            header: "Actions",
            cell: (project) => (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowTagsDialog(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Etiketleri Yönet
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

      {selectedProject && (
        <ProjectTagsDialog
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          open={showTagsDialog}
          onOpenChange={(open) => {
            setShowTagsDialog(open);
            if (!open) {
              setSelectedProject(null);
              // Refresh project data to update tag counts
              loadProjects();
            }
          }}
        />
      )}
    </div>
  );
}
