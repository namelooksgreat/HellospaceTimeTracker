import { Shield, Code, User } from "lucide-react";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return {
          icon: Shield,
          label: "Yönetici",
          className: "bg-primary/10 text-primary border-primary/20",
        };
      case "developer":
        return {
          icon: Code,
          label: "Geliştirici",
          className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        };
      default:
        return {
          icon: User,
          label: "Kullanıcı",
          className: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}
