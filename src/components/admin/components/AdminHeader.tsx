import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  viewMode?: {
    current: "table" | "grid";
    onChange: (mode: "table" | "grid") => void;
  };
  actions?: React.ReactNode;
}

export function AdminHeader({
  title,
  description,
  viewMode,
  actions,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {viewMode && (
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
              <Button
                variant={viewMode.current === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => viewMode.onChange("table")}
                className="h-8 px-2"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode.current === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => viewMode.onChange("grid")}
                className="h-8 px-2"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
