import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Users, Briefcase, Clock, Settings } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Customers", href: "/admin/customers", icon: Briefcase },
  { name: "Projects", href: "/admin/projects", icon: Clock },
  { name: "Time Entries", href: "/admin/time-entries", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col border-r border-border bg-card fixed left-0 top-0 bottom-0">
        <div className="flex flex-col h-full">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-6 py-4 overflow-y-auto">
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-x-3",
                        isActive && "bg-accent text-accent-foreground",
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-72">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border h-16 flex items-center px-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {
              navigation.find((item) => location.pathname.startsWith(item.href))
                ?.name
            }
          </h1>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
