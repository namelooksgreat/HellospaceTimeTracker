import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

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

export const exportToExcel = async (data: ExportData): Promise<void> => {
  const workbook = new ExcelJS.Workbook();

  // Summary Sheet
  const periodText =
    {
      daily: "Bugün",
      weekly: "Bu Hafta",
      monthly: "Bu Ay",
      yearly: "Bu Yıl",
    }[data.timeRange] || data.timeRange;

  const summarySheet = workbook.addWorksheet("Summary");

  // Add summary data
  summarySheet.addRow([`${data.userName} - Zaman Raporu`]);
  summarySheet.addRow([]);
  summarySheet.addRow(["Kullanıcı", data.userName]);
  summarySheet.addRow(["Dönem", periodText]);
  summarySheet.addRow(["Toplam Süre", formatDuration(data.totalDuration)]);
  summarySheet.addRow([
    "Toplam Kazanç",
    `${data.totalEarnings.toFixed(2)} ${data.currency}`,
  ]);
  summarySheet.addRow(["Saatlik Ücret", `${data.hourlyRate} ${data.currency}`]);

  // Style summary sheet
  summarySheet.getColumn(1).width = 15;
  summarySheet.getColumn(2).width = 30;
  summarySheet.mergeCells("A1:B1");

  // Entries Sheet
  const entriesSheet = workbook.addWorksheet("Zaman Girişleri");

  // Add headers
  entriesSheet.columns = [
    { header: "Tarih", key: "date", width: 15 },
    { header: "Saat", key: "time", width: 12 },
    { header: "Görev", key: "task", width: 40 },
    { header: "Proje", key: "project", width: 30 },
    { header: "Süre", key: "duration", width: 15 },
  ];

  // Add data rows
  data.entries.forEach((entry) => {
    entriesSheet.addRow({
      date: new Date(entry.start_time).toLocaleDateString("tr-TR"),
      time: new Date(entry.start_time).toLocaleTimeString("tr-TR"),
      task: entry.task_name,
      project: entry.project?.name || "-",
      duration: formatDuration(entry.duration),
    });
  });

  // Save workbook
  await workbook.xlsx.writeFile(`${data.userName}-time-report.xlsx`);
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
