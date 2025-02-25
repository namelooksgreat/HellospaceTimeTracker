import { useState, useEffect } from "react";
import { Invitation } from "@/types/invitations";
import { Card } from "@/components/ui/card";
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
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import {
  createInvitation,
  listInvitations,
  deleteInvitation,
} from "@/lib/api/invitations";
import { AdminTable } from "../components/AdminTable";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { Plus, Copy, Mail, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "user" as Invitation["role"],
  });

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await listInvitations();
      setInvitations(data);
    } catch (error) {
      handleError(error, "InvitationsPage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleCreateInvitation = async () => {
    try {
      const invitation = await createInvitation(formData.email, formData.role);
      const inviteUrl = `${window.location.origin}/auth?token=${invitation.token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);

      showSuccess("Davet linki oluşturuldu");

      await loadInvitations();
      setShowCreateDialog(false);
      setFormData({ email: "", role: "user" });
    } catch (error) {
      handleError(error, "InvitationsPage");
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Davetler"
        description="Kullanıcı davetlerini yönetin"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Davet
          </Button>
        }
      />

      <AdminTable
        data={invitations}
        columns={[
          {
            header: "Email",
            cell: (invitation) => invitation.email,
          },
          {
            header: "Rol",
            cell: (invitation) => invitation.role,
          },
          {
            header: "Durum",
            cell: (invitation) => (
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  invitation.used_at
                    ? "bg-green-100 text-green-800"
                    : new Date(invitation.expires_at) < new Date()
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {invitation.used_at
                  ? "Kullanıldı"
                  : new Date(invitation.expires_at) < new Date()
                    ? "Süresi Doldu"
                    : "Aktif"}
              </div>
            ),
          },
          {
            header: "Oluşturulma",
            cell: (invitation) =>
              format(new Date(invitation.created_at), "d MMMM yyyy HH:mm", {
                locale: tr,
              }),
          },
          {
            header: "Son Kullanma",
            cell: (invitation) =>
              format(new Date(invitation.expires_at), "d MMMM yyyy HH:mm", {
                locale: tr,
              }),
          },
          {
            header: "İşlemler",
            cell: (invitation) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const inviteUrl = `${window.location.origin}/auth?token=${invitation.token}`;
                    await navigator.clipboard.writeText(inviteUrl);
                    showSuccess("Davet linki kopyalandı");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Linki Kopyala
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await deleteInvitation(invitation.id);
                      showSuccess("Davet başarıyla silindi");
                      await loadInvitations();
                    } catch (error) {
                      handleError(error, "InvitationsPage");
                    }
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </div>
            ),
          },
        ]}
        loading={loading}
      />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Davet Oluştur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                onValueChange={(value: Invitation["role"]) =>
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
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                İptal
              </Button>
              <Button onClick={handleCreateInvitation}>Davet Oluştur</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
