import { useState, useEffect } from "react";
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
import { Plus, Search, Trash2 } from "lucide-react";
import { CustomerDialog } from "../dialogs/CustomerDialog";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Customer } from "@/types";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadCustomers = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const { data, error } = await supabase
        .from("customers")
        .select(
          `
          id,
          name,
          logo_url,
          created_at,
          user_id,
          projects:projects(id, name, color),
          customer_rates:customer_rates!left(hourly_rate, currency)
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Raw customer data:", data);
      const formattedCustomers: Customer[] = (data || []).map((item: any) => {
        console.log(
          "Processing customer:",
          item.name,
          "rates:",
          item.customer_rates,
        );
        return {
          id: item.id,
          name: item.name,
          logo_url: item.logo_url,
          created_at: item.created_at,
          user_id: item.user_id,
          customer_rates: item.customer_rates
            ? [item.customer_rates].flat()
            : [],
          projects: Array.isArray(item.projects)
            ? item.projects.map((project: any) => ({
                id: project.id,
                name: project.name,
                color: project.color,
                created_at: item.created_at,
                user_id: item.user_id,
                customer_id: item.id,
              }))
            : [],
        };
      });
      setCustomers(formattedCustomers);
    } catch (error) {
      handleError(error, "CustomersPage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", selectedCustomer.id);

      if (error) throw error;
      showSuccess("Müşteri başarıyla silindi");
      loadCustomers();
    } catch (error) {
      handleError(error, "CustomersPage");
    } finally {
      setShowDeleteDialog(false);
      setSelectedCustomer(null);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
        <Button onClick={() => setShowCustomerDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Müşteri Ekle
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri Adı</TableHead>
              <TableHead>Saatlik Ücret</TableHead>
              <TableHead>Projeler</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Müşteri bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>
                    {customer.customer_rates?.[0] ? (
                      <div className="font-mono text-sm">
                        {customer.customer_rates[0].hourly_rate}{" "}
                        {customer.customer_rates[0].currency}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.projects?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {customer.projects.map((project) => (
                          <div
                            key={project.id}
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md"
                            style={{ backgroundColor: project.color + "20" }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Proje yok</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerDialog(true);
                        }}
                      >
                        Düzenle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog
        customer={selectedCustomer}
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onSave={loadCustomers}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
