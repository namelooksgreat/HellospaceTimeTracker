import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { tr } from "date-fns/locale";

interface PaymentChartsProps {
  payments: Array<{
    amount: number;
    payment_date: string;
    status: string;
    payment_method: string;
  }>;
}

export function PaymentCharts({ payments }: PaymentChartsProps) {
  // Monthly data
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const dailyData = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(
    (date) => {
      const dayPayments = payments.filter(
        (payment) =>
          new Date(payment.payment_date).toDateString() ===
            date.toDateString() && payment.status === "completed",
      );

      return {
        date: format(date, "d MMM", { locale: tr }),
        total: dayPayments.reduce((sum, payment) => sum + payment.amount, 0),
      };
    },
  );

  // Payment method distribution
  const methodData = payments
    .filter((payment) => payment.status === "completed")
    .reduce(
      (acc, payment) => {
        const method =
          {
            credit_card: "Kredi Kartı",
            bank_transfer: "Havale/EFT",
            cash: "Nakit",
            other: "Diğer",
          }[payment.payment_method] || "Diğer";

        acc[method] = (acc[method] || 0) + payment.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const methodChartData = Object.entries(methodData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Aylık Tahsilat Grafiği
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickMargin={10}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                fontSize={12}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("tr-TR", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(value)
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Ödeme Yöntemleri Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={methodChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis
                fontSize={12}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("tr-TR", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(value)
                }
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
