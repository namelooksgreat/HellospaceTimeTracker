import jsPDF from "jspdf";
import "jspdf-autotable";
import { ExportData } from "@/types/export";
import {
  formatDuration,
  formatDate,
  formatTime,
  formatCurrency,
} from "./common";

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();

  try {
    // Header
    doc.setFontSize(20);
    doc.text("HELLOSPACE", 20, 20);

    // Customer Info
    doc.setFontSize(16);
    doc.text(`${data.customerName} - ${data.timeRange}`, 20, 35);

    // Summary
    doc.setFontSize(12);
    const summaryData = [
      ["Musteri:", data.customerName],
      ["Ucret:", `${formatCurrency(data.hourlyRate, data.currency)}/saat`],
      ["Toplam Sure:", formatDuration(data.totalDuration)],
      ["Toplam:", formatCurrency(data.totalEarnings, data.currency)],
    ];

    (doc as any).autoTable({
      startY: 45,
      body: summaryData,
      theme: "plain",
      styles: {
        fontSize: 12,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: "bold" },
      },
    });

    // Entries Table
    const tableData = data.entries.map((entry) => [
      entry.task_name || "-",
      formatDate(entry.start_time),
      formatTime(entry.start_time),
      formatDuration(entry.duration),
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Gorev", "Tarih", "Saat", "Sure"]],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
      },
    });

    doc.save(`${data.customerName}_${data.timeRange}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
