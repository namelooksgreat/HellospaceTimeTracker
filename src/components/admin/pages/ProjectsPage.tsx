import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { AdminTable } from "../components/AdminTable";
import { AdminCard } from "../components/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FolderKanban,
  Building2,
  Tag,
  Trash2,
  BarChart2,
  Search,
  Edit,
  MoreHorizontal,
  Clock,
  Users,
} from "lucide-react";
import { ProjectDialog } from "../dialogs/ProjectDialog";
import { ProjectTagsDialog } from "../dialogs/ProjectTagsDialog";
import { useAdminUI } from "@/hooks/useAdminUI";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
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
  tag_count?: number;
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
        // Önce müşterileri yükle
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, name")
          .order("name");

        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // Sonra projeleri yükle
        const { data, error } = await supabase.rpc(
          "get_projects_with_tag_counts",
        );

        if (error) {
          // RPC fonksiyonu yoksa alternatif sorgu kullan
          console.warn("RPC function not available, using fallback query");
          const { data: projectsData, error: projectsError } =
            await supabase.from("projects").select(`
              *,
              customers(id, name),
              project_tags(count),
              time_entries(count)
            `);

          if (projectsError) throw projectsError;

          const transformedData = (projectsData || []).map((project) => ({
            ...project,
            customer: project.customers,
            tag_count: project.project_tags?.length || 0,
            time_entries_count: project.time_entries?.length || 0,
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
          return;
        }

        // RPC fonksiyonu varsa, onun verilerini kullan
        const transformedData = (data || []).map((project: any) => ({
          id: project.project_id,
          name: project.project_name,
          color: project.project_color,
          customer_id: project.customer_id,
          customer: {
            id: project.customer_id,
            name: project.customer_name || "Bilinmiyor",
          },
          created_at: project.created_at,
          tag_count: project.tag_count || 0,
          time_entries_count: project.time_entries_count || 0,
          total_duration: project.total_duration || 0,
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
        loadingMessage: "Projeler yükleniyor...",
        errorMessage: "Projeler yüklenirken bir hata oluştu",
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
        case "customer_asc":
          return (a.customer?.name || "").localeCompare(b.customer?.name || "");
        case "customer_desc":
          return (b.customer?.name || "").localeCompare(a.customer?.name || "");
        case "tags_asc":
          return (a.tag_count || 0) - (b.tag_count || 0);
        case "tags_desc":
          return (b.tag_count || 0) - (a.tag_count || 0);
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

  const totalTags = projects.reduce(
    (sum, project) => sum + (project.tag_count || 0),
    0,
  );

  const totalDuration = projects.reduce(
    (sum, project) => sum + (project.total_duration || 0),
    0,
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (error) {
    return (
      <ErrorState
        title="Projeler yüklenemedi"
        description={error.message}
        onRetry={() => {
          clearError();
          loadProjects();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard
          icon={<FolderKanban className="h-5 w-5 text-primary" />}
          title="Toplam Proje"
          value={projects.length}
          description={`${projects.filter((p) => p.time_entries_count && p.time_entries_count > 0).length} aktif`}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          title="Toplam Süre"
          value={formatDuration(totalDuration)}
          description="Tüm projelerde"
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<Tag className="h-5 w-5 text-primary" />}
          title="Toplam Etiket"
          value={totalTags}
          description="Tüm projelerde"
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />
      </div>

      <AdminHeader
        title="Projeler"
        description="Müşterilere ait projeleri yönetin"
        viewMode={{
          current: viewMode,
          onChange: setViewMode,
        }}
        actions={
          <Button onClick={() => setShowProjectDialog(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" /> Yeni Proje
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Proje ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
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
              <SelectItem value="duration_asc">Süre (Az-Çok)</SelectItem>
              <SelectItem value="duration_desc">Süre (Çok-Az)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedProjects.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <FolderKanban className="h-4 w-4" /> {selectedProjects.length} proje
            seçildi
          </span>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => {}}>
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      )}

      <AdminTable
        data={paginatedProjects}
        className="border rounded-lg overflow-hidden shadow-sm"
        columns={[
          {
            header: "",
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
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-primary/30"
              />
            ),
          },
          {
            header: "Proje",
            cell: (project) => (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-sm"
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
            header: "Süre",
            cell: (project) => (
              <div className="font-mono bg-muted/50 px-2 py-1 rounded-md inline-block">
                {formatDuration(project.total_duration || 0)}
              </div>
            ),
          },
          {
            header: "Etiketler",
            cell: (project) => (
              <Badge variant="outline" className="bg-primary/5">
                {project.tag_count || 0}
              </Badge>
            ),
          },
          {
            header: "Zaman Kayıtları",
            cell: (project) => (
              <Badge variant="outline" className="bg-primary/5">
                {project.time_entries_count || 0}
              </Badge>
            ),
          },
          {
            header: "İşlemler",
            cell: (project) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectDialog(true);
                  }}
                  className="h-8 px-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <Edit className="h-4 w-4 mr-1.5 text-primary" />
                  Düzenle
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedProject(project);
                        // ProjectTagsDialog'u açmak için state'i güncelle
                        setSelectedProjects([project.id]);
                      }}
                      className="cursor-pointer"
                    >
                      <Tag className="h-4 w-4 mr-2 text-blue-500" />
                      Etiketleri Yönet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
          },
        ]}
        loading={isLoading}
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FolderKanban className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              Proje bulunamadı
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
              Arama kriterlerinize uygun proje bulunamadı. Filtreleri
              değiştirmeyi veya yeni bir proje eklemeyi deneyin.
            </p>
            <Button
              onClick={() => setShowProjectDialog(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Yeni Proje Ekle
            </Button>
          </div>
        }
      />

      {filteredProjects.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredProjects.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="bg-card border rounded-lg p-2"
        />
      )}

      <ProjectDialog
        project={selectedProject ? { ...selectedProject, user_id: "" } : null}
        open={showProjectDialog}
        onOpenChange={(open) => {
          setShowProjectDialog(open);
          if (!open) setSelectedProject(null);
        }}
        onSave={loadProjects}
      />

      {selectedProject && (
        <ProjectTagsDialog
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          open={selectedProjects.includes(selectedProject.id)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedProject(null);
              setSelectedProjects([]);
              // Etiket sayılarını güncellemek için projeleri yeniden yükle
              loadProjects();
            }
          }}
        />
      )}
    </div>
  );
}
