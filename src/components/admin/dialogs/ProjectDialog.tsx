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
import { Project, Customer } from "@/types";
import { supabase } from "@/lib/supabase";

interface ProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  onSave,
}: ProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    color: "#94A3B8",
    customer_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{
      id: string;
      name: string;
      logo_url?: string;
    }>
  >([]);

  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name || "",
        color: project.color || "#94A3B8",
        customer_id: project.customer_id || "",
      });
    }

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
          .select("id, name, logo_url")
          .eq("user_id", user.id)
          .order("name");

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        handleError(error, "ProjectDialog");
      }
    };

    if (open) {
      loadCustomers();
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.customer_id) return;

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Kullanıcı bulunamadı");

      if (project?.id) {
        const { error } = await supabase
          .from("projects")
          .update({
            name: formData.name,
            color: formData.color,
            customer_id: formData.customer_id,
          })
          .eq("id", project.id)
          .eq("user_id", user.id);

        if (error) throw error;
        showSuccess("Proje başarıyla güncellendi");
      } else {
        const { error } = await supabase.from("projects").insert([
          {
            name: formData.name,
            color: formData.color,
            customer_id: formData.customer_id,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
        showSuccess("Proje başarıyla eklendi");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "ProjectDialog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? "Projeyi Düzenle" : "Yeni Proje"}
          </DialogTitle>
          <DialogDescription>
            {project
              ? "Proje bilgilerini düzenleyebilirsiniz."
              : "Yeni proje eklemek için bilgileri doldurun."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Proje Adı</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Proje adı"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Müşteri</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, customer_id: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri seçin" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Renk</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-12 h-12 p-1 rounded-lg"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                placeholder="#94A3B8"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1"
              />
            </div>
          </div>

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
