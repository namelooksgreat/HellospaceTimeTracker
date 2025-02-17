import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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

interface CustomerPaymentDialogProps {
  payment: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function CustomerPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSave,
}: CustomerPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "bank_transfer",
    description: "",
    status: "completed",
  });

  useEffect(() => {
    if (open) {
      loadCustomers();
      if (payment) {
        setFormData({
          customer_id: payment.customer_id,
          amount: payment.amount,
          payment_date: new Date(payment.payment_date)
            .toISOString()
            .split("T")[0],
          payment_method: payment.payment_method,
          description: payment.description || "",
          status: payment.status,
        });
      } else {
        setFormData({
          customer_id: "",
          amount: 0,
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "bank_transfer",
          description: "",
          status: "completed",
        });
      }
    }
  }, [open, payment]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      handleError(error, "CustomerPaymentDialog");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || formData.amount <= 0) return;

    setLoading(true);
    try {
      // Start a Supabase transaction
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Kullanıcı bulunamadı");

      if (payment?.id) {
        // Get the old payment amount for balance adjustment
        const { data: oldPayment } = await supabase
          .from("customer_payments")
          .select("amount")
          .eq("id", payment.id)
          .single();

        // Update payment
        const { error: updateError } = await supabase
          .from("customer_payments")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (updateError) throw updateError;

        // Update customer balance
        if (formData.status === "completed") {
          const amountDiff = formData.amount - (oldPayment?.amount || 0);
          const { error: balanceError } = await supabase.rpc(
            "update_customer_balance",
            {
              p_customer_id: formData.customer_id,
              p_amount: amountDiff,
            },
          );
          if (balanceError) throw balanceError;
        }

        showSuccess("Ödeme başarıyla güncellendi");
      } else {
        // Insert new payment
        const { error: insertError } = await supabase
          .from("customer_payments")
          .insert([
            {
              ...formData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;

        // Update customer balance for completed payments
        if (formData.status === "completed") {
          const { error: balanceError } = await supabase.rpc(
            "update_customer_balance",
            {
              p_customer_id: formData.customer_id,
              p_amount: formData.amount,
            },
          );
          if (balanceError) throw balanceError;
        }

        showSuccess("Ödeme başarıyla eklendi");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "CustomerPaymentDialog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? "Ödeme Düzenle" : "Yeni Ödeme"}</DialogTitle>
          <DialogDescription>
            {payment
              ? "Ödeme bilgilerini düzenleyebilirsiniz."
              : "Yeni ödeme eklemek için bilgileri doldurun."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Müşteri</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, customer_id: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri seçin" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tutar</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Ödeme Tarihi</Label>
            <Input
              type="date"
              value={formData.payment_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_date: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Ödeme Yöntemi</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, payment_method: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Ödeme yöntemi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                <SelectItem value="bank_transfer">Havale/EFT</SelectItem>
                <SelectItem value="cash">Nakit</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Durum</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="cancelled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Ödeme hakkında not ekleyin"
            />
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
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
