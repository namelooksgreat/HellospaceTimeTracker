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
  Building2,
  DollarSign,
  Users,
  Trash2,
  BarChart2,
  Search,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { CustomerDialog } from "../dialogs/CustomerDialog";
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

interface Customer {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
  total_amount?: number;
  total_paid?: number;
  balance?: number;
  user_count?: number;
  project_count?: number;
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState("name_asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();

  const loadCustomers = async () => {
    await handleAsync(
      async () => {
        const { data, error } = await supabase.from("customers").select(`
            *,
            customer_balances(total_amount, total_paid, balance),
            projects:projects(count),
            users:user_customers(count)
          `);

        if (error) throw error;

        const transformedData = (data || []).map((customer) => ({
          ...customer,
          total_amount: customer.customer_balances?.[0]?.total_amount || 0,
          total_paid: customer.customer_balances?.[0]?.total_paid || 0,
          balance: customer.customer_balances?.[0]?.balance || 0,
          user_count: customer.users?.length || 0,
          project_count: customer.projects?.length || 0,
        }));

        setCustomers(transformedData);
        filterAndSortCustomers(transformedData, searchQuery, sortBy);
      },
      {
        loadingMessage: "Loading customers...",
        errorMessage: "Failed to load customers",
      },
    );
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filterAndSortCustomers = (
    data: Customer[],
    query: string,
    sort: string,
  ) => {
    let filtered = data.filter((customer) =>
      customer.name.toLowerCase().includes(query.toLowerCase()),
    );

    filtered.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "balance_asc":
          return (a.balance || 0) - (b.balance || 0);
        case "balance_desc":
          return (b.balance || 0) - (a.balance || 0);
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  useEffect(() => {
    filterAndSortCustomers(customers, searchQuery, sortBy);
  }, [customers, searchQuery, sortBy]);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalBalance = customers.reduce(
    (sum, customer) => sum + (customer.balance || 0),
    0,
  );
  const totalPaid = customers.reduce(
    (sum, customer) => sum + (customer.total_paid || 0),
    0,
  );

  if (error) {
    return (
      <ErrorState
        title="Failed to load customers"
        description={error.message}
        onRetry={() => {
          clearError();
          loadCustomers();
        }}
      />
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard
          icon={<Building2 className="h-5 w-5 text-primary" />}
          title="Total Customers"
          value={customers.length}
          description={`${customers.filter((c) => c.balance && c.balance > 0).length} active`}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          trend={{
            value: Math.round((totalPaid / (totalBalance + totalPaid)) * 100),
            label: "collection rate",
            isPositive: true,
          }}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Total Projects"
          value={customers.reduce((sum, c) => sum + (c.project_count || 0), 0)}
          description="Across all customers"
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />
      </div>

      <AdminHeader
        title="Customers"
        description="Manage your customer relationships"
        viewMode={{
          current: viewMode,
          onChange: setViewMode,
        }}
        actions={
          <Button onClick={() => setShowCustomerDialog(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" /> New Customer
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="balance_asc">Balance (Low-High)</SelectItem>
              <SelectItem value="balance_desc">Balance (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCustomers.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Building2 className="h-4 w-4" /> {selectedCustomers.length}{" "}
            customer(s) selected
          </span>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => {}}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <AdminTable
        data={paginatedCustomers}
        className="border rounded-lg overflow-hidden shadow-sm"
        columns={[
          {
            header: "",
            cell: (customer) => (
              <Checkbox
                checked={selectedCustomers.includes(customer.id)}
                onCheckedChange={(checked) => {
                  setSelectedCustomers((prev) =>
                    checked
                      ? [...prev, customer.id]
                      : prev.filter((id) => id !== customer.id),
                  );
                }}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-primary/30"
              />
            ),
          },
          {
            header: "Customer",
            cell: (customer) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
                  {customer.logo_url ? (
                    <img
                      src={customer.logo_url}
                      alt={customer.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-primary">
                      {customer.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.project_count} projects
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Balance",
            cell: (customer) => (
              <div className="font-mono bg-muted/50 px-2 py-1 rounded-md inline-block">
                {formatCurrency(customer.balance || 0)}
              </div>
            ),
          },
          {
            header: "Projects",
            cell: (customer) => (
              <div className="text-center font-medium">
                {customer.project_count}
              </div>
            ),
          },
          {
            header: "Users",
            cell: (customer) => (
              <div className="text-center font-medium">
                {customer.user_count}
              </div>
            ),
          },
          {
            header: "Actions",
            cell: (customer) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerDialog(true);
                  }}
                  className="h-8 px-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <Edit className="h-4 w-4 mr-1.5 text-primary" />
                  Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = `/admin/customers/${customer.id}/report`)
                      }
                      className="cursor-pointer"
                    >
                      <BarChart2 className="h-4 w-4 mr-2 text-indigo-500" />
                      View Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
          },
        ]}
        loading={isLoading}
      />

      {filteredCustomers.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredCustomers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="bg-card border rounded-lg p-2"
        />
      )}

      <CustomerDialog
        customer={
          selectedCustomer ? { ...selectedCustomer, user_id: "" } : null
        }
        open={showCustomerDialog}
        onOpenChange={(open) => {
          setShowCustomerDialog(open);
          if (!open) setSelectedCustomer(null);
        }}
        onSave={loadCustomers}
      />
    </div>
  );
}
