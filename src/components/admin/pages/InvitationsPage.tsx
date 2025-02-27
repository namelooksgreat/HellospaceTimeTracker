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
import { supabase } from "@/lib/supabase";
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
import { CreateInvitationDialog } from "../dialogs/CreateInvitationDialog";

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      console.log("Davetiye listesi yükleniyor...");
      const data = await listInvitations();
      console.log(
        "Davetiye listesi yüklendi:",
        data.length,
        "davetiye bulundu",
      );
      setInvitations(data);
    } catch (error) {
      console.error("Davetiye listesi yükleme hatası:", error);
      handleError(error, "InvitationsPage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

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
                  ? `Kullanıldı (${format(new Date(invitation.used_at), "d MMM yyyy HH:mm", { locale: tr })})`
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
                    const inviteUrl = `${window.location.origin}/auth?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`;
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
                      // RPC fonksiyonu çağır
                      const { error } = await supabase.rpc(
                        "delete_invitation",
                        {
                          invitation_id: invitation.id,
                        },
                      );

                      if (error) {
                        console.error("RPC silme hatası:", error);
                        throw error;
                      }

                      showSuccess("Davet başarıyla silindi");
                      // Listeyi yenile
                      loadInvitations();
                    } catch (error) {
                      console.error("Davetiye silme hatası:", error);
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

      <CreateInvitationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onInviteCreated={loadInvitations}
      />
    </div>
  );
}
