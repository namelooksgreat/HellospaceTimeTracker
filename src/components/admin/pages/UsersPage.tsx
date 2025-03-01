import { useState, useEffect } from "react";
import { useRealtimeSync } from "@/lib/hooks/useRealtimeSync";
import { supabase } from "@/lib/supabase";
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
  Mail,
  CreditCard,
} from "lucide-react";
import { getUsers, deleteUser, createUser, User } from "@/lib/api/users";
import { UserDialog } from "../dialogs/UserDialog";
import { UserAssociationsDialog } from "../dialogs/UserAssociationsDialog";
import { CreateInvitationDialog } from "../dialogs/CreateInvitationDialog";
import { BankInfoDialog } from "../dialogs/BankInfoDialog";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess, showError } from "@/lib/utils/toast";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
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
        loadingMessage: "Loading users...",
        errorMessage: "Failed to load users",
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
        <AdminCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Toplam Kullanıcı"
          value={users.length}
        />

        <AdminCard
          icon={<ShieldCheck className="h-5 w-5 text-primary" />}
          title="Admin Sayısı"
          value={users.filter((u) => u.user_type === "admin").length}
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
        />
      </div>

      <AdminHeader
        title="Users"
        viewMode={{
          current: viewMode,
          onChange: setViewMode,
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
              <Mail className="mr-2 h-4 w-4" /> Davet Gönder
            </Button>
            <Button onClick={handleCreateUser}>
              <Plus className="mr-2 h-4 w-4" /> New User
            </Button>
          </div>
        }
      />

      <AdminFilters
        searchProps={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Kullanıcı ara...",
        }}
        selectedCount={selectedUsers.length}
        bulkActions={
          <>
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
          </>
        }
      >
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Rol seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
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
            <SelectItem value="date_asc">En Eski</SelectItem>
            <SelectItem value="date_desc">En Yeni</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>

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
          <AdminTable
            data={paginatedUsers}
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
                  />
                ),
              },
              {
                header: "Full Name",
                cell: (user) => (
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
                            {(user.full_name || user.email)[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-background" />
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
                header: "Role",
                cell: (user) => <RoleBadge role={user.user_type as UserRole} />,
              },
              {
                header: "Registration Date",
                cell: (user) => (
                  <div className="space-y-1">
                    <div className="text-sm">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "-"}
                    </div>
                    <ActivityIndicator lastActive={user.last_active} />
                  </div>
                ),
              },
              {
                header: "Actions",
                cell: (user) => (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDialog(true);
                      }}
                      className="admin-button"
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowBankInfoDialog(true);
                      }}
                      className="admin-button"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Banka
                    </Button>
                  </div>
                ),
              },
            ]}
          />
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
