import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { CustomerDialog } from "@/components/admin/dialogs/CustomerDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCustomers, createCustomer } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load customers",
      });
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update({ name: data.name })
          .eq("id", editingCustomer.id);

        if (error) throw error;
      } else {
        await createCustomer(data);
      }

      toast({
        title: "Success",
        description: `Customer ${editingCustomer ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not ${editingCustomer ? "update" : "create"} customer`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      loadCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete customer",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <CustomersTable
          customers={customers}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setDialogOpen(true);
          }}
          onDelete={handleDelete}
        />

        <CustomerDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCustomer(null);
            }
            setDialogOpen(open);
          }}
          customer={editingCustomer}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
}
