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
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

interface CustomerRate {
  id?: string;
  hourly_rate: number;
  currency: string;
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
            console.error("Error loading customer rate:", rateError);
            return;
          }

          if (rateData) {
            setFormData((prev) => ({
              ...prev,
              hourly_rate: rateData.hourly_rate,
              currency: rateData.currency,
            }));
          }
        } catch (error) {
          console.error("Error loading customer data:", error);
        }
      };

      loadCustomerData();

      // Load customer's projects
      const loadProjects = async () => {
        try {
          const { data, error } = await supabase
            .from("projects")
            .select("id, name, color")
            .eq("customer_id", customer.id)
            .order("name");

          if (error) throw error;
          setProjects(data || []);
        } catch (error) {
          handleError(error, "CustomerDialog");
        }
      };

      loadProjects();
    } else {
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
      if (!user) throw new Error("Kullanıcı bulunamadı");

      if (customer?.id) {
        // Update customer
        const { error: customerError } = await supabase
          .from("customers")
          .update({
            name: formData.name,
            logo_url: formData.logo_url || null,
          })
          .eq("id", customer.id);

        if (customerError) throw customerError;

        // Check if rate exists
        const { data: existingRate, error: checkError } = await supabase
          .from("customer_rates")
          .select("id")
          .eq("customer_id", customer.id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingRate) {
          // Update existing rate
          const { error: rateError } = await supabase
            .from("customer_rates")
            .update({
              hourly_rate: formData.hourly_rate,
              currency: formData.currency,
            })
            .eq("customer_id", customer.id);

          if (rateError) throw rateError;
        } else {
          // Insert new rate
          const { error: rateError } = await supabase
            .from("customer_rates")
            .insert({
              customer_id: customer.id,
              hourly_rate: formData.hourly_rate,
              currency: formData.currency,
            });

          if (rateError) throw rateError;
        }

        showSuccess("Müşteri başarıyla güncellendi");
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert([
            {
              name: formData.name,
              logo_url: formData.logo_url || null,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (customerError) throw customerError;

        // Insert customer rate for new customer
        if (newCustomer) {
          const { error: rateError } = await supabase
            .from("customer_rates")
            .insert([
              {
                customer_id: newCustomer.id,
                hourly_rate: formData.hourly_rate,
                currency: formData.currency,
              },
            ]);

          if (rateError) throw rateError;
        }

        showSuccess("Müşteri başarıyla eklendi");
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
            {customer ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Müşteri bilgilerini düzenleyebilirsiniz."
              : "Yeni müşteri eklemek için bilgileri doldurun."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Müşteri Adı</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Müşteri adı"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={formData.logo_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, logo_url: e.target.value }))
              }
              placeholder="Logo URL (opsiyonel)"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label>Saatlik Ücret</Label>
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
                placeholder="Saatlik ücret"
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
                  <SelectValue placeholder="Para birimi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {customer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Projeler</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {projects.length > 0 ? (
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Henüz proje eklenmemiş
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
