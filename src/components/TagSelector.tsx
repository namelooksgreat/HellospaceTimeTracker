import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tag as TagIcon, X, ChevronDown, Check, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface ProjectTag {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

interface TagSelectorProps {
  projectId: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export function TagSelector({
  projectId,
  selectedTags,
  onTagsChange,
  className,
}: TagSelectorProps) {
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (projectId) {
      loadProjectTags();
    }
  }, [projectId]);

  const loadProjectTags = async () => {
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
      handleError(error, "TagSelector");
      console.error("Etiketler yüklenirken bir hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const getSelectedTagNames = () => {
    return tags
      .filter((tag) => selectedTags.includes(tag.id))
      .map((tag) => tag.name);
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const selectAllTags = () => {
    onTagsChange(filteredTags.map((tag) => tag.id));
  };

  if (!projectId || tags.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1 border-dashed",
            selectedTags.length > 0 && "border-solid",
            className,
          )}
        >
          <TagIcon className="h-3.5 w-3.5" />
          <span className="truncate max-w-[120px]">
            {selectedTags.length > 0
              ? selectedTags.length === 1
                ? getSelectedTagNames()[0]
                : `${selectedTags.length} etiket seçildi`
              : "Etiketler"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTags.length > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{filteredTags.length} etiket bulundu</span>
                <div className="flex gap-2">
                  <button
                    className="hover:text-primary transition-colors"
                    onClick={selectAllTags}
                  >
                    Tümünü seç
                  </button>
                  <span>|</span>
                  <button
                    className="hover:text-primary transition-colors"
                    onClick={clearAllTags}
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <div className="max-h-[200px] overflow-y-auto pr-1 -mr-1 space-y-1">
                {filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors",
                      selectedTags.includes(tag.id)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/30",
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <div className="flex-shrink-0">
                      {selectedTags.includes(tag.id) ? (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div
                          className="w-4 h-4 rounded-full ring-1 ring-border/50"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                    </div>
                    <span className="text-sm flex-1">{tag.name}</span>
                  </div>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-2">
                    Seçilen etiketler:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags
                      .filter((tag) => selectedTags.includes(tag.id))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10"
                        >
                          {tag.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTag(tag.id);
                            }}
                          />
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "Etiket bulunamadı" : "Henüz etiket eklenmemiş"}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
