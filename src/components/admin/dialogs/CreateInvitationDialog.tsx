import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvitation } from "@/lib/api/invitations";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteCreated: () => void;
}

export function CreateInvitationDialog({
  open,
  onOpenChange,
  onInviteCreated,
}: CreateInvitationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "user" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setLoading(true);
    try {
      const invitation = await createInvitation(formData.email, formData.role);
      const inviteUrl = `${window.location.origin}/auth?token=${invitation.token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);

      toast.success("Davet linki oluşturuldu", {
        description: "Link panoya kopyalandı",
      });

      onInviteCreated();
      onOpenChange(false);
      setFormData({ email: "", role: "user" });
    } catch (error) {
      handleError(error, "CreateInvitationDialog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Davet Oluştur</DialogTitle>
          <DialogDescription>
            Kullanıcıya gönderilecek davet linkini oluşturun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Davet edilecek email adresi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value: typeof formData.role) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Davet Oluştur"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
