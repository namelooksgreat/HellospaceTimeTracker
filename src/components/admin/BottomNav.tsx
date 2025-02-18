import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Users,
  Building2,
  FolderKanban,
  Clock,
  Settings,
  DollarSign,
} from "lucide-react";

const menuItems = [
  { icon: BarChart, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Building2, label: "Customers", href: "/admin/customers" },
  { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
  { icon: Clock, label: "Time Entries", href: "/admin/time-entries" },
  { icon: DollarSign, label: "Payments", href: "/admin/payments" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 print:hidden safe-area-bottom w-full h-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center",
                  "w-16 h-14",
                  "touch-manipulation select-none",
                  "transition-all duration-300",
                  "hover:text-foreground",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-1">
                  <div className="relative p-2 rounded-xl transition-all duration-300 hover:bg-accent/50">
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive && "scale-110",
                      )}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10 rounded-xl animate-in fade-in-0 duration-300" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-300",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
