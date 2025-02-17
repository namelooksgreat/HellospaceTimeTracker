import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Link,
  BarChart2,
  Users,
  ShieldCheck,
  UserPlus,
  LayoutList,
  LayoutGrid,
  UserCog,
  Trash2,
} from "lucide-react";
import { getUsers, deleteUser, createUser, User } from "@/lib/api/users";
import { UserDialog } from "../dialogs/UserDialog";
import { UserAssociationsDialog } from "../dialogs/UserAssociationsDialog";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess, showError } from "@/lib/utils/toast";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useAdminUI } from "@/hooks/useAdminUI";
import { RoleBadge } from "@/components/ui/role-badge";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { UserCard } from "../UserCard";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssociationsDialog, setShowAssociationsDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

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
        loadingMessage: "Loading users...",
        errorMessage: "Failed to load users",
      },
    );
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filterAndSortUsers = (data: User[], query: string) => {
    // Önce filtreleme yap
    let filteredData = data.filter(
      (user) =>
        (user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(query.toLowerCase())) &&
        (roleFilter === "all" || user.user_type === roleFilter),
    );

    // Sonra sıralama yap
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    await handleAsync(
      async () => {
        await deleteUser(selectedUser.id);
        await loadUsers();
        setShowDeleteDialog(false);
        setSelectedUser(null);
      },
      {
        loadingMessage: "Deleting user...",
        successMessage: "User deleted successfully",
        errorMessage: "Failed to delete user",
      },
    );
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load users"
        description={error.message}
        onRetry={() => {
          clearError();
          loadUsers();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group admin-card">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm text-muted-foreground">
                Toplam Kullanıcı
              </div>
              <div className="text-2xl font-bold">{users.length}</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group admin-card">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm text-muted-foreground">Admin Sayısı</div>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.user_type === "admin").length}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group admin-card">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm text-muted-foreground">Bu Ay Katılan</div>
              <div className="text-2xl font-bold">
                {
                  users.filter(
                    (u) =>
                      (u.created_at
                        ? new Date(u.created_at).getMonth()
                        : -1) === new Date().getMonth(),
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Users
          </h1>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-2"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleCreateUser}
          className="w-full sm:w-auto h-10 sm:h-9 admin-button"
        >
          <Plus className="mr-2 h-4 w-4" /> New User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg animate-slide-up">
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} user(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkRoleDialog(true)}
              className="h-8"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Change Role
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Rol seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="admin">Yöneticiler</SelectItem>
              <SelectItem value="developer">Geliştiriciler</SelectItem>
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
              <SelectItem value="date_asc">En Eski</SelectItem>
              <SelectItem value="date_desc">En Yeni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedUsers.map((user) => (
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
            ))}
          </div>
        ) : (
          <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === paginatedUsers.length}
                      onCheckedChange={(checked) => {
                        setSelectedUsers(
                          checked ? paginatedUsers.map((user) => user.id) : [],
                        );
                      }}
                    />
                  </TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <LoadingState
                        title="Loading Users"
                        description="Please wait while we fetch user data..."
                      />
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="table-row-hover">
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            setSelectedUsers((prev) =>
                              checked
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id),
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || user.email}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold text-primary">
                                  {(user.full_name ||
                                    user.email)[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-background" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.full_name || "-"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.user_type} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "-"}
                          </div>
                          <ActivityIndicator lastActive={user.last_active} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAssociationsDialog(true);
                            }}
                            className="admin-button"
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Relations
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/admin/users/${user.id}/report`)
                            }
                            className="admin-button"
                          >
                            <BarChart2 className="h-4 w-4 mr-2" />
                            Reports
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
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
    </div>
  );
}
