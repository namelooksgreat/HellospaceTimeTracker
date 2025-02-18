import { User } from "@/types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { RoleBadge } from "../ui/role-badge";
import { ActivityIndicator } from "../ui/activity-indicator";
import { UserCog, Link, BarChart2 } from "lucide-react";
import { UserRole } from "@/types/roles";

interface UserCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onViewReport: () => void;
  onManageRelations: () => void;
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  onViewReport,
  onManageRelations,
}: UserCardProps) {
  return (
    <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{user.full_name || "-"}</h3>
              <RoleBadge role={user.user_type as UserRole} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="mt-1">
              <ActivityIndicator lastActive={user.last_active} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 px-2.5 rounded-lg hover:bg-accent/50"
          >
            <UserCog className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageRelations}
            className="h-8 px-2.5 rounded-lg hover:bg-accent/50"
          >
            <Link className="h-4 w-4 mr-1.5" />
            Relations
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewReport}
            className="h-8 px-2.5 rounded-lg hover:bg-accent/50"
          >
            <BarChart2 className="h-4 w-4 mr-1.5" />
            Report
          </Button>
        </div>
      </div>
    </Card>
  );
}
