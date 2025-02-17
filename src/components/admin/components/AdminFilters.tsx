import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFiltersProps {
  children?: React.ReactNode;
  searchProps?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  selectedCount?: number;
  bulkActions?: React.ReactNode;
  className?: string;
}

export function AdminFilters({
  children,
  searchProps,
  selectedCount,
  bulkActions,
  className,
}: AdminFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center gap-4",
        className,
      )}
    >
      {selectedCount !== undefined && bulkActions && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg animate-slide-up">
          <span className="text-sm text-muted-foreground">
            {selectedCount} item(s) selected
          </span>
          {bulkActions}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {searchProps && (
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchProps.placeholder || "Search..."}
              value={searchProps.value}
              onChange={(e) => searchProps.onChange(e.target.value)}
              className="pl-10 h-10 sm:h-9"
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
