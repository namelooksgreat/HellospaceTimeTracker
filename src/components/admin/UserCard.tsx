import { User } from "@/types";
import { Card } from "@/components/ui/card";
import { RoleBadge } from "@/components/ui/role-badge";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { Button } from "@/components/ui/button";
import { MoreVertical, Link, BarChart2, UserCog, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <div className="relative p-6">
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <UserCog className="h-4 w-4 mr-2" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageRelations}>
                <Link className="h-4 w-4 mr-2" /> Manage Relations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewReport}>
                <BarChart2 className="h-4 w-4 mr-2" /> View Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 ring-4 ring-primary/20 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-primary">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{user.full_name || "-"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <RoleBadge role={user.user_type || "user"} />

          <div className="w-full pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Joined</span>
              <span>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <ActivityIndicator lastActive={user.last_active} />
          </div>
        </div>
      </div>
    </Card>
  );
}
