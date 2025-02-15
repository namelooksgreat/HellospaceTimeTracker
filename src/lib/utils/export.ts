import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Add type declaration for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}
import { TimeEntry } from "@/types";

interface ExportData {
  userName: string;
  timeRange: string;
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
  entries: TimeEntry[];
}

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();

  // Use default Helvetica font
  doc.setFont("helvetica");

  // Header
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

  // Title
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text(`${data.userName} - Zaman Raporu`, 14, 25, { charSpace: 0.5 });

  // Summary Section
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);

  const periodText =
    {
      daily: "Bugün",
      weekly: "Bu Hafta",
      monthly: "Bu Ay",
      yearly: "Bu Yıl",
    }[data.timeRange] || data.timeRange;

  doc.text(`Dönem: ${periodText}`, 14, 45);
  doc.text(`Toplam Süre: ${formatDuration(data.totalDuration)}`, 14, 55);
  doc.text(
    `Toplam Kazanç: ${data.totalEarnings.toFixed(2)} ${data.currency}`,
    14,
    65,
  );
  doc.text(`Saatlik Ücret: ${data.hourlyRate} ${data.currency}`, 14, 75);

  // Time Entries Table
  const tableData = data.entries.map((entry) => [
    new Date(entry.start_time).toLocaleDateString(),
    new Date(entry.start_time).toLocaleTimeString(),
    entry.task_name,
    entry.project?.name || "-",
    formatDuration(entry.duration),
  ]);

  doc.autoTable({
    startY: 85,
    head: [["Tarih", "Saat", "Görev", "Proje", "Süre"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [55, 65, 81],
    },
    headStyles: {
      fillColor: [17, 24, 39],
      fontSize: 11,
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30 },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  doc.save(`${data.userName}-time-report.pdf`);
};

export const exportToExcel = (data: ExportData) => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const periodText =
    {
      daily: "Bugün",
      weekly: "Bu Hafta",
      monthly: "Bu Ay",
      yearly: "Bu Yıl",
    }[data.timeRange] || data.timeRange;

  const summaryData = [
    [`${data.userName} - Zaman Raporu`],
    [],
    ["Kullanıcı", data.userName],
    ["Dönem", periodText],
    ["Toplam Süre", formatDuration(data.totalDuration)],
    ["Toplam Kazanç", `${data.totalEarnings.toFixed(2)} ${data.currency}`],
    ["Saatlik Ücret", `${data.hourlyRate} ${data.currency}`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Style the summary sheet
  summarySheet["!cols"] = [{ wch: 15 }, { wch: 30 }];
  summarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

  // Entries Sheet
  const entriesData = data.entries.map((entry) => ({
    Tarih: new Date(entry.start_time).toLocaleDateString("tr-TR"),
    Saat: new Date(entry.start_time).toLocaleTimeString("tr-TR"),
    Görev: entry.task_name,
    Proje: entry.project?.name || "-",
    Süre: formatDuration(entry.duration),
  }));

  const entriesSheet = XLSX.utils.json_to_sheet(entriesData);
  entriesSheet["!cols"] = [
    { wch: 15 }, // Tarih
    { wch: 12 }, // Saat
    { wch: 40 }, // Görev
    { wch: 30 }, // Proje
    { wch: 15 }, // Süre
  ];

  XLSX.utils.book_append_sheet(workbook, entriesSheet, "Zaman Girişleri");

  XLSX.writeFile(workbook, `${data.userName}-time-report.xlsx`);
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
