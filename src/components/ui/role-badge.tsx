import { cn } from "@/lib/utils";
import { UserRole } from "@/types/roles";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = {
    admin: "bg-primary/10 text-primary border-primary/20",
    developer:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    designer:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800",
    user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[role],
      )}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}
