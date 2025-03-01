import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Link,
  BarChart2,
  Users,
  ShieldCheck,
  UserPlus,
  UserCog,
  Trash2,
  Mail,
  CreditCard,
  MoreHorizontal,
  ChevronDown,
  Search,
  Filter,
  Shield,
} from "lucide-react";
import { getUsers, User } from "@/lib/api/users";
import { UserDialog } from "../dialogs/UserDialog";
import { UserAssociationsDialog } from "../dialogs/UserAssociationsDialog";
import { CreateInvitationDialog } from "../dialogs/CreateInvitationDialog";
import { BankInfoDialog } from "../dialogs/BankInfoDialog";
import { ErrorState } from "@/components/ui/error-state";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useAdminUI } from "@/hooks/useAdminUI";
import { RoleBadge } from "@/components/ui/role-badge";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { UserCard } from "../UserCard";
import { UserRole } from "@/types/roles";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { AdminTable } from "../components/AdminTable";
import { AdminCard } from "../components/AdminCard";
import { Input } from "@/components/ui/input";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAssociationsDialog, setShowAssociationsDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBankInfoDialog, setShowBankInfoDialog] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { isLoading, error, handleAsync, clearError } = useAdminUI();

  const loadUsers = async () => {
    await handleAsync(
      async () => {
        const data = await getUsers();
        setUsers(data);
        filterAndSortUsers(data, searchQuery);
      },
      {
        loadingMessage: "Kullanıcılar yükleniyor...",
        errorMessage: "Kullanıcılar yüklenirken bir hata oluştu",
      },
    );
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filterAndSortUsers = (data: User[], query: string) => {
    let filteredData = data.filter(
      (user) =>
        (user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(query.toLowerCase())) &&
        (roleFilter === "all" || user.user_type === roleFilter),
    );

    filteredData.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return (a.full_name || "").localeCompare(b.full_name || "");
        case "name_desc":
          return (b.full_name || "").localeCompare(a.full_name || "");
        case "date_asc":
          return (
            (a.created_at ? new Date(a.created_at).getTime() : 0) -
            (b.created_at ? new Date(b.created_at).getTime() : 0)
          );
        case "date_desc":
          return (
            (b.created_at ? new Date(b.created_at).getTime() : 0) -
            (a.created_at ? new Date(a.created_at).getTime() : 0)
          );
        default:
          return 0;
      }
    });

    setFilteredUsers(filteredData);
  };

  useEffect(() => {
    filterAndSortUsers(users, searchQuery);
  }, [searchQuery, users, roleFilter, sortBy]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowCreateDialog(true);
  };

  if (error) {
    return (
      <ErrorState
        title="Kullanıcılar yüklenemedi"
        description={error.message}
        onRetry={() => {
          clearError();
          loadUsers();
        }}
        className="bg-card border rounded-lg p-6"
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Toplam Kullanıcı"
          value={users.length}
          description={`${users.filter((u) => u.is_active).length} aktif kullanıcı`}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<ShieldCheck className="h-5 w-5 text-primary" />}
          title="Admin Sayısı"
          value={users.filter((u) => u.user_type === "admin").length}
          description="Yönetici yetkisine sahip kullanıcılar"
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<UserPlus className="h-5 w-5 text-primary" />}
          title="Bu Ay Katılan"
          value={
            users.filter(
              (u) =>
                (u.created_at ? new Date(u.created_at).getMonth() : -1) ===
                new Date().getMonth(),
            ).length
          }
          description={`${new Date().toLocaleString("tr-TR", { month: "long" })} ayında katılan kullanıcılar`}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />
      </div>

      <AdminHeader
        title="Kullanıcı Yönetimi"
        description="Sistem kullanıcılarını yönetin, düzenleyin ve izleyin"
        viewMode={{
          current: viewMode,
          onChange: setViewMode,
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(true)}
              className="h-9"
            >
              <Mail className="mr-2 h-4 w-4" /> Davet Gönder
            </Button>
            <Button onClick={handleCreateUser} className="h-9">
              <Plus className="mr-2 h-4 w-4" /> Yeni Kullanıcı
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="İsim veya e-posta ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Rol filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="admin">Yöneticiler</SelectItem>
              <SelectItem value="developer">Geliştiriciler</SelectItem>
              <SelectItem value="designer">Tasarımcılar</SelectItem>
              <SelectItem value="user">Kullanıcılar</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">İsim (A-Z)</SelectItem>
              <SelectItem value="name_desc">İsim (Z-A)</SelectItem>
              <SelectItem value="date_asc">Kayıt (Eski-Yeni)</SelectItem>
              <SelectItem value="date_desc">Kayıt (Yeni-Eski)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Shield className="h-4 w-4" /> {selectedUsers.length} kullanıcı
            seçildi
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkRoleDialog(true)}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Rol Değiştir
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={() => {
                    setSelectedUser(user);
                    setShowUserDialog(true);
                  }}
                  onDelete={() => {
                    setSelectedUser(user);
                    setShowDeleteDialog(true);
                  }}
                  onViewReport={() =>
                    (window.location.href = `/admin/users/${user.id}/report`)
                  }
                  onManageRelations={() => {
                    setSelectedUser(user);
                    setShowAssociationsDialog(true);
                  }}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/30">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Kullanıcı bulunamadı
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                  Arama kriterlerinize uygun kullanıcı bulunamadı. Filtreleri
                  değiştirmeyi veya yeni bir kullanıcı eklemeyi deneyin.
                </p>
                <Button
                  onClick={handleCreateUser}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Yeni Kullanıcı Ekle
                </Button>
              </div>
            )}
          </div>
        ) : (
          <AdminTable
            data={paginatedUsers}
            className="border rounded-lg overflow-hidden shadow-sm"
            columns={[
              {
                header: "",
                cell: (user) => (
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      setSelectedUsers((prev) =>
                        checked
                          ? [...prev, user.id]
                          : prev.filter((id) => id !== user.id),
                      );
                    }}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-primary/30"
                  />
                ),
              },
              {
                header: "Kullanıcı Bilgileri",
                cell: (user) => (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-primary">
                            {(user.full_name || user.email)[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      {user.is_active && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-background" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.full_name || "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                header: "Rol",
                cell: (user) => (
                  <div className="flex items-center">
                    <RoleBadge role={user.user_type as UserRole} />
                  </div>
                ),
              },
              {
                header: "Kayıt Tarihi",
                cell: (user) => (
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium bg-muted/50 px-2 py-1 rounded-md inline-block">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "tr-TR",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "-"}
                    </div>
                    <ActivityIndicator lastActive={user.last_active} />
                  </div>
                ),
              },
              {
                header: "İşlemler",
                cell: (user) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDialog(true);
                      }}
                      className="h-8 px-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                    >
                      <UserCog className="h-4 w-4 mr-1.5 text-primary" />
                      Düzenle
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAssociationsDialog(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Link className="h-4 w-4 mr-2 text-blue-500" />
                          İlişkiler
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/admin/users/${user.id}/report`)
                          }
                          className="cursor-pointer"
                        >
                          <BarChart2 className="h-4 w-4 mr-2 text-indigo-500" />
                          Raporlar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBankInfoDialog(true);
                          }}
                          className="cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4 mr-2 text-green-500" />
                          Banka Bilgisi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ]}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Kullanıcı bulunamadı
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                  Arama kriterlerinize uygun kullanıcı bulunamadı. Filtreleri
                  değiştirmeyi veya yeni bir kullanıcı eklemeyi deneyin.
                </p>
                <Button
                  onClick={handleCreateUser}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Yeni Kullanıcı Ekle
                </Button>
              </div>
            }
          />
        )}

        {filteredUsers.length > 0 && (
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            className="bg-card border rounded-lg p-2"
          />
        )}
      </div>

      <UserDialog
        user={selectedUser}
        open={showUserDialog || showCreateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowUserDialog(false);
            setShowCreateDialog(false);
            setSelectedUser(null);
          }
        }}
        onSave={loadUsers}
      />

      <UserAssociationsDialog
        user={selectedUser}
        open={showAssociationsDialog}
        onOpenChange={setShowAssociationsDialog}
        onSave={loadUsers}
      />

      <CreateInvitationDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInviteCreated={loadUsers}
      />

      {selectedUser && (
        <BankInfoDialog
          userId={selectedUser.id}
          userName={selectedUser.full_name || ""}
          userEmail={selectedUser.email}
          open={showBankInfoDialog}
          onOpenChange={setShowBankInfoDialog}
          onDelete={loadUsers}
        />
      )}
    </div>
  );
}
