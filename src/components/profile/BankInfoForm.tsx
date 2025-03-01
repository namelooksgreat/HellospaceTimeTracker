import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { Loader2, CreditCard, Building, User, Check } from "lucide-react";

interface BankInfo {
  id?: string;
  user_id: string;
  bank_name: string;
  account_holder: string;
  iban: string;
  branch_name?: string;
}

export function BankInfoForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    user_id: user?.id || "",
    bank_name: "",
    account_holder: "",
    iban: "",
    branch_name: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadBankInfo();
    }
  }, [user?.id]);

  const loadBankInfo = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bank_info")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for no rows returned
        throw error;
      }

      if (data) {
        setBankInfo(data);
      }
    } catch (error) {
      handleError(error, "BankInfoForm");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      const formData = {
        ...bankInfo,
        user_id: user.id,
      };

      let operation;
      if (bankInfo.id) {
        // Update existing record
        operation = supabase
          .from("bank_info")
          .update(formData)
          .eq("id", bankInfo.id);
      } else {
        // Insert new record
        operation = supabase.from("bank_info").insert(formData);
      }

      const { error } = await operation;
      if (error) throw error;

      toast.success("Banka bilgileri başarıyla kaydedildi", {
        icon: <Check className="h-4 w-4 text-green-500" />,
      });

      // Reload data to get the ID if it was a new record
      loadBankInfo();
    } catch (error) {
      handleError(error, "BankInfoForm");
    } finally {
      setSaving(false);
    }
  };

  const formatIBAN = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
    // Format with spaces every 4 characters
    return cleaned.replace(/(.{4})(?=.)/g, "$1 ").trim();
  };

  const handleIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatIBAN(e.target.value);
    setBankInfo((prev) => ({ ...prev, iban: formattedValue }));
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              Banka Bilgileri
            </h2>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <CardContent className="relative z-10 p-6 space-y-6">
        <div className="flex items-center gap-2 text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            Banka Bilgileri
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank_name" className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Banka Adı</span>
              </Label>
              <Input
                id="bank_name"
                name="bank_name"
                value={bankInfo.bank_name}
                onChange={handleChange}
                placeholder="Örn: Garanti Bankası"
                required
                className="bg-background/50 hover:bg-accent/50 transition-all duration-150"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="account_holder"
                className="flex items-center gap-1"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Hesap Sahibi</span>
              </Label>
              <Input
                id="account_holder"
                name="account_holder"
                value={bankInfo.account_holder}
                onChange={handleChange}
                placeholder="Hesap sahibinin tam adı"
                required
                className="bg-background/50 hover:bg-accent/50 transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban" className="flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <span>IBAN</span>
            </Label>
            <Input
              id="iban"
              name="iban"
              value={bankInfo.iban}
              onChange={handleIBANChange}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              required
              className="font-mono bg-background/50 hover:bg-accent/50 transition-all duration-150"
            />
            <p className="text-xs text-muted-foreground">
              Boşluklar otomatik olarak eklenecektir.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch_name" className="flex items-center gap-1">
              <span>Şube Adı</span>
            </Label>
            <Input
              id="branch_name"
              name="branch_name"
              value={bankInfo.branch_name || ""}
              onChange={handleChange}
              placeholder="Örn: Kadıköy Şubesi"
              className="bg-background/50 hover:bg-accent/50 transition-all duration-150"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Bilgileri Kaydet"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
