import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { Tag, X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

interface ProjectTag {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

export function ProjectTagsDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ProjectTagsDialogProps) {
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6"); // Default blue color
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined colors for tags
  const colorOptions = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
  ];

  // Load project tags when dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadProjectTags();
    }
  }, [open, projectId]);

  const loadProjectTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_tags")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      handleError(error, "ProjectTagsDialog");
      toast.error("Etiketler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Etiket adı boş olamaz");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from("project_tags")
        .insert({
          project_id: projectId,
          name: newTagName.trim(),
          color: newTagColor,
        })
        .select();

      if (error) throw error;

      setTags([...tags, data[0]]);
      setNewTagName("");
      toast.success("Etiket başarıyla eklendi");
    } catch (error) {
      handleError(error, "ProjectTagsDialog");
      toast.error("Etiket eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from("project_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;

      setTags(tags.filter((tag) => tag.id !== tagId));
      toast.success("Etiket başarıyla silindi");
    } catch (error) {
      handleError(error, "ProjectTagsDialog");
      toast.error("Etiket silinirken bir hata oluştu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <span>{projectName} Proje Etiketleri</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Yeni Etiket Ekle</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Etiket adı"
                  className="w-full h-10"
                />
              </div>
              <div className="flex gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newTagColor === color
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-110",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Renk seç: ${color}`}
                  />
                ))}
              </div>
              <Button
                onClick={handleAddTag}
                disabled={isSubmitting || !newTagName.trim()}
                size="icon"
                className="h-10 w-10"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mevcut Etiketler</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 border rounded-md bg-muted/30">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="ml-1 rounded-full hover:bg-black/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm border rounded-md bg-muted/30">
                Bu proje için henüz etiket eklenmemiş
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
