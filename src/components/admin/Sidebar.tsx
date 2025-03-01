import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Users,
  Building2,
  FolderKanban,
  Clock,
  Settings,
  Tag,
} from "lucide-react";

interface SidebarProps {
  onNavigation?: () => void;
}

import { CreditCard } from "lucide-react";

const menuItems = [
  { icon: BarChart, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Building2, label: "Customers", href: "/admin/customers" },
  { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
  { icon: Tag, label: "Project Tags", href: "/admin/project-tags" },
  { icon: Clock, label: "Time Entries", href: "/admin/time-entries" },
  { icon: CreditCard, label: "Banka Bilgileri", href: "/admin/bank-info" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function Sidebar({ onNavigation }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border/50 bg-card/50 min-h-[calc(100dvh-3.5rem)] lg:min-h-[calc(100dvh-4rem)] backdrop-blur-xl">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigation}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200",
                "active:scale-[0.98] touch-manipulation select-none",
                "hover:bg-accent/50 hover:text-accent-foreground hover:shadow-sm",
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
