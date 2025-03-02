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
  CreditCard,
  Mail,
  DollarSign,
  FileText,
} from "lucide-react";

interface SidebarProps {
  onNavigation?: () => void;
}

const menuGroups = [
  {
    title: "Overview",
    items: [{ icon: BarChart, label: "Dashboard", href: "/admin" }],
  },
  {
    title: "User Management",
    items: [
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: Mail, label: "Invitations", href: "/admin/invitations" },
      { icon: CreditCard, label: "Bank Info", href: "/admin/bank-info" },
    ],
  },
  {
    title: "Business",
    items: [
      { icon: Building2, label: "Customers", href: "/admin/customers" },
      { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
      { icon: Tag, label: "Project Tags", href: "/admin/project-tags" },
    ],
  },
  {
    title: "Time & Billing",
    items: [
      { icon: Clock, label: "Time Entries", href: "/admin/time-entries" },
      { icon: DollarSign, label: "Payments", href: "/admin/payments" },
      { icon: FileText, label: "Reports", href: "/admin/reports" },
    ],
  },
  {
    title: "System",
    items: [{ icon: Settings, label: "Settings", href: "/admin/settings" }],
  },
];

export function Sidebar({ onNavigation }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border/50 bg-card/50 min-h-[calc(100dvh-3.5rem)] lg:min-h-[calc(100dvh-4rem)] backdrop-blur-xl">
      <nav className="p-4 space-y-6">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            <div className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onNavigation}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
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
          </div>
        ))}
      </nav>
    </aside>
  );
}
