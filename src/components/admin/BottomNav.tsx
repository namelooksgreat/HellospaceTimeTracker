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
  Mail,
  ChevronUp,
  Tag,
  FileText,
  CreditCard,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuGroups = [
  {
    title: "Main",
    items: [
      { icon: BarChart, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: Building2, label: "Customers", href: "/admin/customers" },
      { icon: Clock, label: "Time", href: "/admin/time-entries" },
    ],
  },
  {
    title: "More",
    items: [
      { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
      { icon: Tag, label: "Tags", href: "/admin/project-tags" },
      { icon: Mail, label: "Invites", href: "/admin/invitations" },
      { icon: DollarSign, label: "Payments", href: "/admin/payments" },
      { icon: CreditCard, label: "Bank Info", href: "/admin/bank-info" },
      { icon: FileText, label: "Reports", href: "/admin/reports" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  },
];

export function BottomNav() {
  const [expanded, setExpanded] = useState(false);
  const primaryItems = menuGroups[0].items;
  const secondaryItems = menuGroups[1].items;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 print:hidden safe-area-bottom w-full">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="container max-w-7xl mx-auto px-4 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2 py-3 border-b border-border/30">
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setExpanded(false)}
                  className={({ isActive }) =>
                    cn(
                      "relative flex flex-col items-center justify-center",
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
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground/70",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container max-w-7xl mx-auto px-4 relative">
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background rounded-full p-1 shadow-md border border-border/50 z-10"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </motion.button>

        <div className="flex items-center justify-between py-2">
          {primaryItems.map((item) => (
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
