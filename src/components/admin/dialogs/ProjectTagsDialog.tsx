import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Tag, Trash2, X, Edit, Check } from "lucide-react";

interface ProjectTag {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

interface ProjectTagsDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTagsDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ProjectTagsDialogProps) {
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Predefined colors for quick selection
  const colorOptions = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#6366f1", // Indigo
    "#14b8a6", // Teal
  ];

  useEffect(() => {
    if (open && projectId) {
      loadTags();
    }
  }, [open, projectId]);

  const loadTags = async () => {
    if (!projectId) return;

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
      setLoading(true);
      const { data, error } = await supabase
        .from("project_tags")
        .insert({
          project_id: projectId,
          name: newTagName.trim(),
          color: newTagColor,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setTags([...tags, data]);
      setNewTagName("");
      toast.success("Etiket başarıyla eklendi");
    } catch (error) {
      handleError(error, "ProjectTagsDialog");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      setLoading(true);

      // First check if tag is used in any time entries
      const { data: usageData, error: usageError } = await supabase
        .from("time_entry_tags")
        .select("count")
        .eq("tag_id", tagId);

      if (usageError) throw usageError;

      // If tag is in use, show warning
      if (usageData && usageData.length > 0) {
        const confirmDelete = window.confirm(
          "Bu etiket zaman kayıtlarında kullanılıyor. Silmek istediğinize emin misiniz?",
        );
        if (!confirmDelete) {
          setLoading(false);
          return;
        }
      }

      // Delete tag
      const { error } = await supabase
        .from("project_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;

      setTags(tags.filter((tag) => tag.id !== tagId));
      toast.success("Etiket başarıyla silindi");
    } catch (error) {
      handleError(error, "ProjectTagsDialog");
    } finally {
      setLoading(false);
    }
  };

  const startEditTag = (tag: ProjectTag) => {
    setEditingTag(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setEditTagName("");
    setEditTagColor("");
  };

  const saveEditTag = async (tagId: string) => {
    if (!editTagName.trim()) {
      toast.error("Etiket adı boş olamaz");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("project_tags")
        .update({
          name: editTagName.trim(),
          color: editTagColor,
        })
        .eq("id", tagId);

      if (error) throw error;

      setTags(
        tags.map((tag) =>
          tag.id === tagId
            ? { ...tag, name: editTagName.trim(), color: editTagColor }
            : tag,
        ),
      );
      setEditingTag(null);
      toast.success("Etiket başarıyla güncellendi");
    } catch (error) {
      handleError(error, "ProjectTagsDialog");
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <span>{projectName} - Proje Etiketleri</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Input
              placeholder="Etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Add new tag form */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h3 className="text-sm font-medium">Yeni Etiket Ekle</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="tag-name" className="sr-only">
                  Etiket Adı
                </Label>
                <Input
                  id="tag-name"
                  placeholder="Etiket adı"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div className="w-24">
                <Label htmlFor="tag-color" className="sr-only">
                  Renk
                </Label>
                <Input
                  id="tag-color"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-10 p-1 cursor-pointer"
                />
              </div>
              <Button
                onClick={handleAddTag}
                disabled={loading || !newTagName.trim()}
                className="shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Ekle
              </Button>
            </div>

            {/* Color presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Tags list */}
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="text-sm font-medium">Mevcut Etiketler</h3>
              <div className="text-xs text-muted-foreground">
                {filteredTags.length} etiket
              </div>
            </div>

            {loading && tags.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery
                  ? "Arama kriterlerine uygun etiket bulunamadı"
                  : "Henüz etiket eklenmemiş"}
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="divide-y">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      {editingTag === tag.id ? (
                        <div className="flex items-center gap-3 flex-1">
                          <Input
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Input
                            type="color"
                            value={editTagColor}
                            onChange={(e) => setEditTagColor(e.target.value)}
                            className="w-16 h-9 p-1 cursor-pointer"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => saveEditTag(tag.id)}
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEditTag}
                              className="h-8 w-8 text-muted-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <Badge
                              variant="outline"
                              className="px-2 py-0 h-6 text-xs flex items-center gap-1 bg-primary/5"
                              style={{ borderColor: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditTag(tag)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
