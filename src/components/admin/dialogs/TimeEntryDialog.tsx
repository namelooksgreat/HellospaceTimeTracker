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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { TimeEntry, Project } from "@/types";
import { supabase } from "@/lib/supabase";

interface TimeEntryDialogProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
    customer: { id: string; name: string } | null;
  }>;
}

export function TimeEntryDialog({
  entry,
  open,
  onOpenChange,
  onSave,
}: TimeEntryDialogProps) {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    project_id: "",
    duration: 0,
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (entry && open) {
      setFormData({
        task_name: entry.task_name || "",
        description: entry.description || "",
        project_id: entry.project?.id || "",
        duration: entry.duration || 0,
      });
    }

    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*, customer:customers(name)")
          .order("name");

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        handleError(error, "TimeEntryDialog");
      }
    };

    if (open) {
      loadProjects();
    }
  }, [entry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task_name.trim()) return;

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Kullanıcı bulunamadı");

      if (entry?.id) {
        const { error } = await supabase
          .from("time_entries")
          .update({
            task_name: formData.task_name,
            description: formData.description,
            project_id: formData.project_id || null,
            duration: formData.duration,
          })
          .eq("id", entry.id)
          .eq("user_id", user.id);

        if (error) throw error;
        showSuccess("Zaman girişi başarıyla güncellendi");
      } else {
        const { error } = await supabase.from("time_entries").insert([
          {
            task_name: formData.task_name,
            description: formData.description,
            project_id: formData.project_id || null,
            duration: formData.duration,
            user_id: user.id,
            start_time: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        showSuccess("Zaman girişi başarıyla eklendi");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "TimeEntryDialog");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {entry ? "Zaman Girişini Düzenle" : "Yeni Zaman Girişi"}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? "Zaman girişi bilgilerini düzenleyebilirsiniz."
              : "Yeni zaman girişi eklemek için bilgileri doldurun."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Görev Adı</Label>
            <Input
              value={formData.task_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, task_name: e.target.value }))
              }
              placeholder="Görev adı"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Proje</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, project_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Proje seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full ring-1 ring-border/50"
                        style={{ backgroundColor: project.color }}
                      />
                      <span>
                        {project.name}
                        {project.customer?.name &&
                          ` (${project.customer.name})`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Süre (saat:dakika)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                value={Math.floor(formData.duration / 3600)}
                onChange={(e) => {
                  const hours = parseInt(e.target.value) || 0;
                  const minutes = Math.floor((formData.duration % 3600) / 60);
                  setFormData((prev) => ({
                    ...prev,
                    duration: hours * 3600 + minutes * 60,
                  }));
                }}
                placeholder="Saat"
              />
              <Input
                type="number"
                min="0"
                max="59"
                value={Math.floor((formData.duration % 3600) / 60)}
                onChange={(e) => {
                  const hours = Math.floor(formData.duration / 3600);
                  const minutes = parseInt(e.target.value) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    duration: hours * 3600 + minutes * 60,
                  }));
                }}
                placeholder="Dakika"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Açıklama ekleyin (opsiyonel)"
              className="min-h-[100px]"
            />
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
