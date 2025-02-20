import { cn } from "@/lib/utils";
import { UserRole } from "@/types/roles";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const styles = {
    base: "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors duration-200",
    admin: "bg-foreground/10 text-foreground border-foreground/20",
    developer: "bg-foreground/10 text-foreground border-foreground/20",
    designer: "bg-foreground/10 text-foreground border-foreground/20",
    user: "bg-foreground/10 text-foreground border-foreground/20",
  };

  const labels = {
    admin: "Admin",
    developer: "Developer",
    designer: "Designer",
    user: "User",
  };

  return (
    <span
      className={cn(
        styles.base,
        styles[role],
        "hover:bg-foreground/20",
        className,
      )}
    >
      {labels[role]}
    </span>
  );
}
