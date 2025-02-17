import { useState, useEffect } from "react";
import { useRealtimeSync } from "@/lib/hooks/useRealtimeSync";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  DollarSign,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerPaymentDialog } from "../dialogs/CustomerPaymentDialog";
import { PaymentCharts } from "../charts/PaymentCharts";
import { exportToPDF, exportToExcel } from "@/lib/utils/export-payments";

type PaymentStatus = "all" | "pending" | "completed" | "cancelled";

export function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [status, setStatus] = useState<PaymentStatus>("all");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [balanceSummary, setBalanceSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    balance: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, balancesResponse] = await Promise.all([
        supabase
          .from("customer_payments")
          .select(
            `
            *,
            customer:customers(id, name)
          `,
          )
          .order("payment_date", { ascending: false }),
        supabase.from("customer_balances").select("*"),
      ]);

      if (paymentsResponse.error) throw paymentsResponse.error;
      if (balancesResponse.error) throw balancesResponse.error;

      setPayments(paymentsResponse.data || []);

      // Calculate summary
      const summary = (balancesResponse.data || []).reduce(
        (acc, curr) => ({
          totalAmount: acc.totalAmount + Number(curr.total_amount),
          totalPaid: acc.totalPaid + Number(curr.total_paid),
          balance: acc.balance + Number(curr.balance),
        }),
        { totalAmount: 0, totalPaid: 0, balance: 0 },
      );

      setBalanceSummary(summary);
    } catch (error) {
      handleError(error, "CustomerPaymentsPage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeSync("customer_payments", () => {
    loadData();
  });

  const filteredPayments = payments.filter((payment) => {
    // Search filter
    const searchMatch =
      payment.customer?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const statusMatch =
      status === "all" || (status && payment.status === status);

    // Date range filter
    let dateMatch = true;
    if (dateRange?.from) {
      const paymentDate = new Date(payment.payment_date);
      const start = dateRange.from;
      const end = dateRange.to || dateRange.from;
      dateMatch = paymentDate >= start && paymentDate <= end;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Müşteri Ödemeleri</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF(filteredPayments)}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(filteredPayments)}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={() => setShowPaymentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ödeme Ekle
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Toplam Alacak</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {formatCurrency(balanceSummary.totalAmount)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Toplam Tahsilat</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {formatCurrency(balanceSummary.totalPaid)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Kalan Bakiye</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {formatCurrency(balanceSummary.balance)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentCharts payments={payments} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={status}
            onValueChange={(value: PaymentStatus) => setStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="cancelled">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Ödeme Tarihi</TableHead>
              <TableHead>Ödeme Yöntemi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Ödeme bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.customer?.name}</TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {payment.payment_method === "credit_card"
                      ? "Kredi Kartı"
                      : payment.payment_method === "bank_transfer"
                        ? "Havale/EFT"
                        : payment.payment_method === "cash"
                          ? "Nakit"
                          : "Diğer"}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {payment.status === "completed"
                        ? "Tamamlandı"
                        : payment.status === "pending"
                          ? "Beklemede"
                          : "İptal Edildi"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {payment.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentDialog(true);
                      }}
                    >
                      Düzenle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerPaymentDialog
        payment={selectedPayment}
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onSave={loadData}
      />
    </div>
  );
}
