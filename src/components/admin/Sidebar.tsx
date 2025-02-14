import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Users,
  Building2,
  FolderKanban,
  Clock,
  Settings,
} from "lucide-react";

const menuItems = [
  { icon: BarChart, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Building2, label: "Customers", href: "/admin/customers" },
  { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
  { icon: Clock, label: "Time Entries", href: "/admin/time-entries" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                "hover:bg-accent/50",
                isActive
                  ? "bg-accent/50 text-accent-foreground font-medium"
                  : "text-muted-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
