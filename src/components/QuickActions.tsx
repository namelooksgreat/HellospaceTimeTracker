import { Plus, Clock, BarChart2, Settings } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-background/80 via-background/50 to-background/30 dark:from-black/80 dark:via-black/60 dark:to-black/40 text-primary ring-1 ring-border/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <Plus className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border-border/50 bg-gradient-to-br from-background/95 via-background/90 to-background/80 backdrop-blur-xl shadow-xl overflow-hidden"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="relative z-10">
            <DropdownMenuItem className="py-2.5 focus:bg-accent/50 transition-colors duration-150">
              <Clock className="mr-2 h-4 w-4" />
              New Time Entry
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2.5 focus:bg-accent/50 transition-colors duration-150">
              <BarChart2 className="mr-2 h-4 w-4" />
              View Reports
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2.5 focus:bg-accent/50 transition-colors duration-150">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
