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

export function CustomerDialog({
  customer,
  open,
  onOpenChange,
  onSave,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
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
      setFormData({
        name: customer.name || "",
        logo_url: customer.logo_url || "",
      });

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
        const { error } = await supabase
          .from("customers")
          .update({
            name: formData.name,
            logo_url: formData.logo_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id)
          .eq("user_id", user.id);

        if (error) throw error;
        showSuccess("Müşteri başarıyla güncellendi");
      } else {
        const { error } = await supabase.from("customers").insert([
          {
            name: formData.name,
            logo_url: formData.logo_url || null,
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
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
