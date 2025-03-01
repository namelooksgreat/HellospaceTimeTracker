import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
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
  Clock,
  Trash2,
  Search,
  Edit,
  MoreHorizontal,
  Calendar,
  User,
  FolderKanban,
} from "lucide-react";
import { useAdminUI } from "@/hooks/useAdminUI";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TimeEntry {
  id: string;
  task_name: string;
  project_id?: string;
  user_id?: string;
  duration: number;
  start_time: string;
  description?: string;
  created_at: string;
  project?: {
    id: string;
    name: string;
    color: string;
    customer?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    full_name?: string;
    email?: string;
  };
  tags?: Array<{ id: string; name: string; color: string }>;
}

export function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date_desc");
  const [userFilter, setUserFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();
  const { user } = useAuth();

  const loadData = async () => {
    await handleAsync(
      async () => {
        // Kullanıcıları yükle
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, full_name")
          .order("full_name");

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Projeleri yükle
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, name")
          .order("name");

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        // Zaman kayıtlarını yükle
        const { data: entriesData, error } = await supabase
          .from("time_entries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Projeleri ve kullanıcıları ayrı ayrı yükle
        const projectIds =
          entriesData?.filter((e) => e.project_id).map((e) => e.project_id) ||
          [];
        const userIds =
          entriesData?.filter((e) => e.user_id).map((e) => e.user_id) || [];

        let projectDetails: Record<string, any> = {};
        let userDetails: Record<string, any> = {};

        if (projectIds.length > 0) {
          const { data: projects } = await supabase
            .from("projects")
            .select("id, name, color, customer_id")
            .in("id", projectIds);

          if (projects) {
            projectDetails = projects.reduce(
              (acc: Record<string, any>, project) => {
                if (project && project.id) {
                  acc[project.id] = project;
                }
                return acc;
              },
              {},
            );
          }

          // Müşterileri yükle
          const customerIds =
            projects?.filter((p) => p.customer_id).map((p) => p.customer_id) ||
            [];
          if (customerIds.length > 0) {
            const { data: customers } = await supabase
              .from("customers")
              .select("id, name")
              .in("id", customerIds);

            if (customers) {
              // Projelere müşteri bilgilerini ekle
              customers.forEach((customer) => {
                Object.values(projectDetails).forEach((project: any) => {
                  if (project.customer_id === customer.id) {
                    project.customer = { id: customer.id, name: customer.name };
                  }
                });
              });
            }
          }
        }

        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from("users")
            .select("id, full_name, email")
            .in("id", userIds);

          if (users) {
            userDetails = users.reduce((acc: Record<string, any>, user) => {
              if (user && user.id) {
                acc[user.id] = user;
              }
              return acc;
            }, {});
          }
        }

        if (error) throw error;

        // Etiketleri yükle
        const timeEntryIds = entriesData?.map((entry) => entry.id) || [];
        let tagData: any[] = [];
        let tagError = null;

        if (timeEntryIds.length > 0) {
          const { data, error } = await supabase
            .from("time_entry_tags")
            .select(
              `
              time_entry_id,
              tag_id,
              project_tags(id, name, color)
            `,
            )
            .in("time_entry_id", timeEntryIds);

          tagData = data || [];
          tagError = error;
        }

        if (tagError) {
          console.warn("Zaman kaydı etiketleri yüklenirken hata:", tagError);
        }

        // Etiketleri zaman kaydı ID'sine göre grupla
        const tagsByEntryId: Record<
          string,
          Array<{ id: string; name: string; color: string }>
        > = (tagData || []).reduce(
          (
            acc: Record<
              string,
              Array<{ id: string; name: string; color: string }>
            >,
            tag: any,
          ) => {
            if (!acc[tag.time_entry_id]) {
              acc[tag.time_entry_id] = [];
            }
            if (tag.project_tags) {
              acc[tag.time_entry_id].push({
                id: tag.tag_id,
                name: tag.project_tags.name,
                color: tag.project_tags.color,
              });
            }
            return acc;
          },
          {},
        );

        const transformedEntries = (entriesData || []).map((entry) => {
          const project =
            entry.project_id &&
            projectDetails &&
            projectDetails[entry.project_id]
              ? projectDetails[entry.project_id]
              : undefined;
          const user =
            entry.user_id && userDetails && userDetails[entry.user_id]
              ? userDetails[entry.user_id]
              : undefined;

          return {
            ...entry,
            project: project
              ? {
                  id: project.id,
                  name: project.name,
                  color: project.color,
                  customer: project.customer,
                }
              : undefined,
            user: user
              ? {
                  id: user.id,
                  full_name: user.full_name,
                  email: user.email,
                }
              : undefined,
            tags: tagsByEntryId[entry.id] || [],
          };
        });

        setEntries(transformedEntries);
        filterAndSortEntries(
          transformedEntries,
          searchQuery,
          sortBy,
          userFilter,
          projectFilter,
        );
      },
      {
        loadingMessage: "Zaman kayıtları yükleniyor...",
        errorMessage: "Zaman kayıtları yüklenirken hata oluştu",
      },
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterAndSortEntries = (
    data: TimeEntry[],
    query: string,
    sort: string,
    userFilter: string,
    projectFilter: string,
  ) => {
    let filtered = data.filter(
      (entry) =>
        (entry.task_name.toLowerCase().includes(query.toLowerCase()) ||
          entry.description?.toLowerCase().includes(query.toLowerCase())) &&
        (userFilter === "all" || entry.user_id === userFilter) &&
        (projectFilter === "all" || entry.project_id === projectFilter),
    );

    filtered.sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "date_desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "duration_asc":
          return a.duration - b.duration;
        case "duration_desc":
          return b.duration - a.duration;
        case "task_asc":
          return a.task_name.localeCompare(b.task_name);
        case "task_desc":
          return b.task_name.localeCompare(a.task_name);
        default:
          return 0;
      }
    });

    setFilteredEntries(filtered);
  };

  useEffect(() => {
    filterAndSortEntries(
      entries,
      searchQuery,
      sortBy,
      userFilter,
      projectFilter,
    );
  }, [entries, searchQuery, sortBy, userFilter, projectFilter]);

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", entryToDelete);

      if (error) throw error;

      toast.success("Zaman kaydı başarıyla silindi");
      loadData();
      setEntryToDelete(null);
    } catch (error) {
      handleError(error, "TimeEntriesPage");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) {
      toast.info("Lütfen silinecek kayıtları seçin");
      return;
    }

    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .in("id", selectedEntries);

      if (error) throw error;

      toast.success(`${selectedEntries.length} kayıt başarıyla silindi`);
      loadData();
      setSelectedEntries([]);
    } catch (error) {
      handleError(error, "TimeEntriesPage");
    }
  };

  const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
  const averageDuration =
    entries.length > 0 ? totalDuration / entries.length : 0;

  if (error) {
    return (
      <ErrorState
        title="Zaman kayıtları yüklenemedi"
        description={error.message}
        onRetry={() => {
          clearError();
          loadData();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          title="Toplam Kayıt"
          value={entries.length}
          description={`${entries.filter((e) => e.duration > 0).length} aktif kayıt`}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<Calendar className="h-5 w-5 text-primary" />}
          title="Toplam Süre"
          value={formatDuration(totalDuration)}
          description="Tüm zaman kayıtları"
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<User className="h-5 w-5 text-primary" />}
          title="Ortalama Süre"
          value={formatDuration(averageDuration)}
          description="Kayıt başına"
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />
      </div>

      <AdminHeader
        title="Zaman Kayıtları"
        description="Tüm kullanıcıların zaman kayıtlarını yönetin"
        viewMode={{
          current: viewMode,
          onChange: setViewMode,
        }}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Görev adı veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Kullanıcı filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Proje filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Projeler</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Tarih (Yeni-Eski)</SelectItem>
              <SelectItem value="date_asc">Tarih (Eski-Yeni)</SelectItem>
              <SelectItem value="duration_desc">Süre (Uzun-Kısa)</SelectItem>
              <SelectItem value="duration_asc">Süre (Kısa-Uzun)</SelectItem>
              <SelectItem value="task_asc">Görev Adı (A-Z)</SelectItem>
              <SelectItem value="task_desc">Görev Adı (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedEntries.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Clock className="h-4 w-4" /> {selectedEntries.length} kayıt seçildi
          </span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-8"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      )}

      <AdminTable
        data={paginatedEntries}
        className="border rounded-lg overflow-hidden shadow-sm"
        columns={[
          {
            header: "",
            cell: (entry) => (
              <Checkbox
                checked={selectedEntries.includes(entry.id)}
                onCheckedChange={(checked) => {
                  setSelectedEntries((prev) =>
                    checked
                      ? [...prev, entry.id]
                      : prev.filter((id) => id !== entry.id),
                  );
                }}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-primary/30"
              />
            ),
          },
          {
            header: "Görev",
            cell: (entry) => (
              <div>
                <div className="font-medium">{entry.task_name}</div>
                {entry.project && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" /> {entry.project.name}
                  </div>
                )}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="px-2 py-0 h-5 text-xs flex items-center gap-1 bg-primary/5"
                        style={{ borderColor: tag.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            header: "Kullanıcı",
            cell: (entry) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
                  <span className="text-sm font-semibold text-primary">
                    {entry.user && entry.user.full_name
                      ? entry.user.full_name[0]
                      : entry.user && entry.user.email
                        ? entry.user.email[0]
                        : "?"}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {entry.user && entry.user.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.user && entry.user.email}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Süre",
            cell: (entry) => (
              <div className="font-mono bg-muted/50 px-2 py-1 rounded-md inline-block">
                {formatDuration(entry.duration)}
              </div>
            ),
          },
          {
            header: "Başlangıç",
            cell: (entry) => (
              <div className="text-sm">
                {new Date(entry.start_time).toLocaleString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            ),
          },
          {
            header: "İşlemler",
            cell: (entry) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setIsEditDialogOpen(true);
                  }}
                  className="h-8 px-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <Edit className="h-4 w-4 mr-1.5 text-primary" />
                  Düzenle
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEntryToDelete(entry.id)}
                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Sil
                </Button>
              </div>
            ),
          },
        ]}
        loading={isLoading}
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              Zaman kaydı bulunamadı
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
              Arama kriterlerinize uygun zaman kaydı bulunamadı. Filtreleri
              değiştirmeyi deneyin.
            </p>
          </div>
        }
      />

      {filteredEntries.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredEntries.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="bg-card border rounded-lg p-2"
        />
      )}

      <AlertDialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zaman Kaydını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu zaman kaydını silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <Button
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              type="button"
            >
              Sil
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zaman Kaydını Düzenle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedEntry && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="task-name"
                    className="text-right font-medium text-sm"
                  >
                    Görev
                  </label>
                  <Input
                    id="task-name"
                    defaultValue={selectedEntry.task_name}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="description"
                    className="text-right font-medium text-sm"
                  >
                    Açıklama
                  </label>
                  <Textarea
                    id="description"
                    defaultValue={selectedEntry.description || ""}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="duration"
                    className="text-right font-medium text-sm"
                  >
                    Süre (sn)
                  </label>
                  <Input
                    id="duration"
                    type="number"
                    defaultValue={selectedEntry.duration}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!selectedEntry) return;

                try {
                  const taskNameInput = document.getElementById(
                    "task-name",
                  ) as HTMLInputElement;
                  const descriptionInput = document.getElementById(
                    "description",
                  ) as HTMLTextAreaElement;
                  const durationInput = document.getElementById(
                    "duration",
                  ) as HTMLInputElement;

                  const { error } = await supabase
                    .from("time_entries")
                    .update({
                      task_name: taskNameInput.value,
                      description: descriptionInput.value,
                      duration: parseInt(durationInput.value),
                    })
                    .eq("id", selectedEntry.id);

                  if (error) throw error;

                  toast.success("Zaman kaydı başarıyla güncellendi");
                  loadData();
                  setIsEditDialogOpen(false);
                } catch (error) {
                  handleError(error, "TimeEntriesPage");
                }
              }}
            >
              Değişiklikleri Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

import { useAuth } from "@/lib/auth";
