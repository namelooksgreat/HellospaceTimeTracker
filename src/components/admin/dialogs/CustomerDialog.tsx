import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { Customer } from "@/types";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function CustomerDialog({
  customer,
  open,
  onOpenChange,
  onSave,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    hourly_rate: 0,
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<
    Array<{
      id: string;
      name: string;
      color: string;
    }>
  >([]);

  useEffect(() => {
    if (customer && open) {
      const loadCustomerData = async () => {
        setFormData({
          name: customer.name || "",
          logo_url: customer.logo_url || "",
          hourly_rate: 0,
          currency: "USD",
        });

        try {
          // Load customer rate
          const { data: rateData, error: rateError } = await supabase
            .from("customer_rates")
            .select("hourly_rate, currency")
            .eq("customer_id", customer.id)
            .maybeSingle();

          if (rateError) {
            handleError(rateError, "CustomerDialog");
            return;
          }

          if (rateData) {
            setFormData((prev) => ({
              ...prev,
              hourly_rate: rateData.hourly_rate,
              currency: rateData.currency,
            }));
          }

          // Load projects
          const { data: projectsData, error: projectsError } = await supabase
            .from("projects")
            .select("id, name, color")
            .eq("customer_id", customer.id)
            .order("name");

          if (projectsError) throw projectsError;
          setProjects(projectsData || []);
        } catch (error) {
          handleError(error, "CustomerDialog");
        }
      };

      loadCustomerData();
    } else {
      // Reset form for new customer
      setFormData({
        name: "",
        logo_url: "",
        hourly_rate: 0,
        currency: "USD",
      });
      setProjects([]);
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not found");

      if (customer?.id) {
        // Update existing customer
        const { error: customerError } = await supabase
          .from("customers")
          .update({
            name: formData.name,
            logo_url: formData.logo_url || null,
          })
          .eq("id", customer.id);

        if (customerError) throw customerError;

        // Check if rate exists first
        const { data: existingRate, error: checkError } = await supabase
          .from("customer_rates")
          .select("*")
          .eq("customer_id", customer.id)
          .maybeSingle();

        if (checkError) throw checkError;

        // Update or insert based on existence
        const { error: rateError } = existingRate
          ? await supabase
              .from("customer_rates")
              .update({
                hourly_rate: formData.hourly_rate,
                currency: formData.currency,
                updated_at: new Date().toISOString(),
              })
              .eq("customer_id", customer.id)
          : await supabase.from("customer_rates").insert({
              customer_id: customer.id,
              hourly_rate: formData.hourly_rate,
              currency: formData.currency,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

        if (rateError) throw rateError;

        showSuccess("Customer updated successfully");
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: formData.name,
            logo_url: formData.logo_url || null,
            user_id: user.id,
          })
          .select()
          .single();

        if (customerError) throw customerError;

        // Create customer rate
        const { error: rateError } = await supabase
          .from("customer_rates")
          .insert({
            customer_id: newCustomer.id,
            hourly_rate: formData.hourly_rate,
            currency: formData.currency,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (rateError) throw rateError;

        // Create customer balance using RPC
        const { error: balanceError } = await supabase.rpc(
          "initialize_customer_balance",
          {
            p_customer_id: newCustomer.id,
          },
        );

        if (balanceError) {
          handleError(balanceError, "CustomerDialog");
          throw balanceError;
        }

        showSuccess("Customer created successfully");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "CustomerDialog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Edit customer information."
              : "Add a new customer to your account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={formData.logo_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, logo_url: e.target.value }))
              }
              placeholder="Enter logo URL (optional)"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label>Hourly Rate</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hourly_rate: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter hourly rate"
                min="0"
                step="0.01"
              />
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {customer && projects.length > 0 && (
            <div className="space-y-2">
              <Label>Projects</Label>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50"
                    >
                      <div
                        className="w-3 h-3 rounded-full ring-1 ring-border/50"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
