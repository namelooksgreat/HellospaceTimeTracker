import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface Payment {
  customer: { name: string };
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description?: string;
}

export const exportToPDF = (payments: Payment[]) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Customer Payments Report", 14, 22);

  // Date
  doc.setFontSize(11);
  const dateStr = format(new Date(), "d MMMM yyyy", { locale: tr });
  doc.text("Created: " + dateStr, 14, 32);

  // Calculate totals
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const formattedTotal = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(total);
  doc.text("Total: " + formattedTotal, 14, 42);

  // Table
  const tableData = payments.map((payment) => [
    payment.customer.name,
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(payment.amount),
    format(new Date(payment.payment_date), "d MMM yyyy", { locale: tr }),
    payment.payment_method === "credit_card"
      ? "Credit Card"
      : payment.payment_method === "bank_transfer"
        ? "Bank Transfer"
        : payment.payment_method === "cash"
          ? "Cash"
          : "Other",
    payment.status === "completed"
      ? "Completed"
      : payment.status === "pending"
        ? "Pending"
        : "Cancelled",
    payment.description || "",
  ]);

  doc.autoTable({
    startY: 50,
    head: [["Customer", "Amount", "Date", "Method", "Status", "Notes"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: 255,
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  doc.save("customer-payments.pdf");
};

export const exportToExcel = (payments: Payment[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    payments.map((payment) => ({
      Customer: payment.customer.name,
      Amount: payment.amount,
      Date: format(new Date(payment.payment_date), "d MMM yyyy", {
        locale: tr,
      }),
      Method:
        payment.payment_method === "credit_card"
          ? "Credit Card"
          : payment.payment_method === "bank_transfer"
            ? "Bank Transfer"
            : payment.payment_method === "cash"
              ? "Cash"
              : "Other",
      Status:
        payment.status === "completed"
          ? "Completed"
          : payment.status === "pending"
            ? "Pending"
            : "Cancelled",
      Notes: payment.description || "",
    })),
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

  XLSX.writeFile(workbook, "customer-payments.xlsx");
};
