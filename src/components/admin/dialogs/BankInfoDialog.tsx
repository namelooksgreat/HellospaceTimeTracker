import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { CreditCard, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BankInfo {
  id: string;
  user_id: string;
  bank_name: string;
  account_holder: string;
  iban: string;
  branch_name?: string;
  created_at: string;
  updated_at: string;
  user_full_name: string;
  user_email: string;
}

interface BankInfoDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
}

export function BankInfoDialog({
  userId,
  userName,
  userEmail,
  open,
  onOpenChange,
  onDelete,
}: BankInfoDialogProps) {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadBankInfo();
    }
  }, [open, userId]);

  const loadBankInfo = async () => {
    try {
      setLoading(true);
      // Use RLS bypass to ensure admin can see all bank info
      const { data, error } = await supabase.rpc("admin_get_bank_info", {
        p_user_id: userId,
      });

      if (error) throw error;

      console.log("Bank info data:", data);
      if (data && data.length > 0) {
        setBankInfo({
          ...data[0],
          user_full_name: userName || "Unknown",
          user_email: userEmail || "Unknown",
        });
      } else {
        toast.info("Bu kullanıcı için banka bilgisi bulunamadı");
        onOpenChange(false);
      }
    } catch (error) {
      handleError(error, "BankInfoDialog");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankInfo = async () => {
    if (!bankInfo) return;
    if (!confirm("Bu banka bilgisini silmek istediğinize emin misiniz?"))
      return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("bank_info")
        .delete()
        .eq("id", bankInfo.id);

      if (error) throw error;

      toast.success("Banka bilgisi başarıyla silindi");
      onDelete?.();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "BankInfoDialog");
    } finally {
      setLoading(false);
    }
  };

  // Format IBAN with spaces for better readability
  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})(?=.)/g, "$1 ").trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="bank-info-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <span>Banka Bilgisi Detayları</span>
          </DialogTitle>
          <p
            id="bank-info-description"
            className="text-sm text-muted-foreground"
          >
            Kullanıcının banka hesap bilgilerini görüntüleyin.
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Banka bilgileri yükleniyor...
          </div>
        ) : bankInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Kullanıcı
                </div>
                <div className="font-medium">{bankInfo.user_full_name}</div>
                <div className="text-sm">{bankInfo.user_email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Banka
                </div>
                <div className="font-medium">{bankInfo.bank_name}</div>
                {bankInfo.branch_name && (
                  <div className="text-sm">{bankInfo.branch_name}</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Hesap Sahibi
              </div>
              <div className="font-medium">{bankInfo.account_holder}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">
                IBAN
              </div>
              <div className="font-mono bg-muted/50 p-2 rounded-md text-sm">
                {formatIBAN(bankInfo.iban)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Oluşturulma Tarihi
                </div>
                <div className="text-sm">
                  {new Date(bankInfo.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Son Güncelleme
                </div>
                <div className="text-sm">
                  {new Date(bankInfo.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Banka bilgisi bulunamadı
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          {bankInfo && (
            <Button
              variant="destructive"
              onClick={handleDeleteBankInfo}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
