/**
 * Fallback PDF generator using jsPDF when Puppeteer is not available
 */
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ExportData } from "@/types/export";
import {
  formatDuration,
  formatDate,
  formatTime,
  formatCurrency,
} from "./common";
import { convertTurkishCharacters, createSafePdfFilename } from "./pdf-utils";
import { embedFonts } from "./pdf-embed-fonts";

// Add type declaration for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// PDF color constants
const PDF_COLORS = {
  PRIMARY: [41, 128, 185],
  TEXT_DARK: [60, 60, 60],
  TEXT_MUTED: [100, 100, 100],
  BORDER: [220, 220, 220],
  BACKGROUND_LIGHT: [245, 247, 250],
  WHITE: [255, 255, 255],
};

/**
 * Fallback PDF generator using jsPDF
 * @param data The data to export
 */
export const generatePDFWithJsPDF = (data: ExportData): void => {
  // Optimize by pre-converting strings that will be used multiple times
  const customerName = convertTurkishCharacters(
    data.customerName || data.userName || "Musteri",
  );
  const timeRange = convertTurkishCharacters(data.timeRange);

  // Create jsPDF instance
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Skip embedding fonts and use default ones
  doc.setFont("helvetica");

  try {
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    // Draw header
    drawHeader(doc, margin, pageWidth);

    // Report title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(
      PDF_COLORS.TEXT_DARK[0],
      PDF_COLORS.TEXT_DARK[1],
      PDF_COLORS.TEXT_DARK[2],
    );
    doc.text(`${customerName} Raporu`, margin, 40);

    // Period subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(
      PDF_COLORS.TEXT_MUTED[0],
      PDF_COLORS.TEXT_MUTED[1],
      PDF_COLORS.TEXT_MUTED[2],
    );
    doc.text(`Donem: ${timeRange}`, margin, 48);

    // Draw summary section
    const summaryY = 60;
    const summaryFinalY = drawSummarySection(
      doc,
      margin,
      pageWidth,
      summaryY,
      data,
    );

    // Time entries section
    const tableY = summaryFinalY + 20;
    drawTimeEntriesSection(doc, margin, pageWidth, tableY, data);

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    drawFooter(doc, margin, pageWidth, finalY);

    // Create a safe filename for the PDF
    const safeCustomerName = createSafePdfFilename(customerName);
    const safeTimeRange = createSafePdfFilename(timeRange);
    const filename = `${safeCustomerName}_${safeTimeRange}_Raporu.pdf`;

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};

/**
 * Draws the header section of the PDF
 */
function drawHeader(doc: jsPDF, margin: number, pageWidth: number): void {
  // Header section with logo
  doc.setFillColor(
    PDF_COLORS.PRIMARY[0],
    PDF_COLORS.PRIMARY[1],
    PDF_COLORS.PRIMARY[2],
  );
  doc.rect(0, 0, pageWidth, 25, "F");

  // Logo would be added here in a real implementation
  // For now, just add the company name in white
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(
    PDF_COLORS.WHITE[0],
    PDF_COLORS.WHITE[1],
    PDF_COLORS.WHITE[2],
  );
  doc.text("HELLOSPACE", margin, 15);

  // Tagline
  doc.setFontSize(10);
  doc.text("Time Tracking", margin, 22);

  // Date on right side
  const today = convertTurkishCharacters(
    new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );
  doc.text(today, pageWidth - margin, 15, { align: "right" });
}

/**
 * Draws the summary section of the PDF
 */
function drawSummarySection(
  doc: jsPDF,
  margin: number,
  pageWidth: number,
  summaryY: number,
  data: ExportData,
): number {
  const summaryWidth = pageWidth - margin * 2;

  // Card background
  doc.setFillColor(
    PDF_COLORS.BACKGROUND_LIGHT[0],
    PDF_COLORS.BACKGROUND_LIGHT[1],
    PDF_COLORS.BACKGROUND_LIGHT[2],
  );
  doc.roundedRect(margin, summaryY, summaryWidth, 90, 5, 5, "F");

  // Card border
  doc.setDrawColor(
    PDF_COLORS.BORDER[0],
    PDF_COLORS.BORDER[1],
    PDF_COLORS.BORDER[2],
  );
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, summaryY, summaryWidth, 90, 5, 5, "S");

  // Summary header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(
    PDF_COLORS.PRIMARY[0],
    PDF_COLORS.PRIMARY[1],
    PDF_COLORS.PRIMARY[2],
  );
  doc.text("OZET BILGILER", margin + 6, summaryY + 15);

  // Divider
  doc.setDrawColor(
    PDF_COLORS.BORDER[0],
    PDF_COLORS.BORDER[1],
    PDF_COLORS.BORDER[2],
  );
  doc.setLineWidth(0.3);
  doc.line(margin + 6, summaryY + 20, pageWidth - margin - 6, summaryY + 20);

  // Summary data layout
  const summaryTableY = summaryY + 30;

  // Create a summary table with clean styling
  doc.autoTable({
    startY: summaryTableY,
    body: [
      ["Musteri:", data.customerName || data.userName || "Musteri"],
      [
        "Saatlik Ucret:",
        `${formatCurrency(data.hourlyRate, data.currency)}/saat`,
      ],
      ["Toplam Sure:", formatDuration(data.totalDuration)],
      ["Toplam Tutar:", formatCurrency(data.totalEarnings, data.currency)],
    ],
    theme: "plain",
    styles: {
      fontSize: 14,
      cellPadding: 8,
      overflow: "linebreak",
      lineColor: PDF_COLORS.WHITE,
      lineWidth: 0,
      font: "helvetica",
      textColor: PDF_COLORS.TEXT_DARK,
    },
    columnStyles: {
      0: {
        cellWidth: 40,
        fontStyle: "bold",
        textColor: PDF_COLORS.TEXT_DARK,
      },
      1: {
        cellWidth: 80,
        fontStyle: "normal",
      },
    },
  });

  return doc.lastAutoTable.finalY;
}

/**
 * Draws the time entries section of the PDF
 */
function drawTimeEntriesSection(
  doc: jsPDF,
  margin: number,
  pageWidth: number,
  tableY: number,
  data: ExportData,
): void {
  // Time entries section header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(
    PDF_COLORS.PRIMARY[0],
    PDF_COLORS.PRIMARY[1],
    PDF_COLORS.PRIMARY[2],
  );
  doc.text("ZAMAN KAYITLARI", margin, tableY - 12);

  // Divider
  doc.setDrawColor(
    PDF_COLORS.BORDER[0],
    PDF_COLORS.BORDER[1],
    PDF_COLORS.BORDER[2],
  );
  doc.setLineWidth(0.3);
  doc.line(margin, tableY - 7, pageWidth - margin, tableY - 7);

  // Group entries by user
  const entriesByUser: Record<string, typeof data.entries> = {};

  data.entries.forEach((entry) => {
    const userName = entry.user_name || entry.user_id || "-";
    if (!entriesByUser[userName]) {
      entriesByUser[userName] = [];
    }
    entriesByUser[userName].push(entry);
  });

  // Prepare table data with user grouping
  const tableData: any[] = [];

  Object.entries(entriesByUser).forEach(([userName, userEntries]) => {
    // Calculate user totals
    const userTotalDuration = userEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0,
    );

    // Add user header row with better styling
    tableData.push([
      {
        content: `${convertTurkishCharacters(userName)} (Toplam: ${formatDuration(userTotalDuration)})`,
        colSpan: 4,
        styles: {
          fillColor: [220, 235, 250],
          textColor: [30, 30, 100],
          fontStyle: "bold",
          cellPadding: { top: 10, right: 8, bottom: 10, left: 12 },
          cellWidth: "auto",
          fontSize: 12,
          lineWidth: { left: 4, top: 0.1, right: 0.1, bottom: 0.1 },
          lineColor: {
            left: [41, 128, 185],
            top: [220, 220, 220],
            right: [220, 220, 220],
            bottom: [220, 220, 220],
          },
        },
      },
    ]);

    // Add user entries
    userEntries.forEach((entry) => {
      const taskName = convertTurkishCharacters(entry.task_name || "-");
      const projectName = convertTurkishCharacters(entry.project?.name || "-");
      const date = convertTurkishCharacters(formatDate(entry.start_time));
      const duration = formatDuration(entry.duration);

      tableData.push([taskName, projectName, date, duration]);
    });
  });

  // Create table with modern styling
  doc.autoTable({
    startY: tableY,
    head: [["Gorev", "Proje", "Tarih", "Sure"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 11,
      cellPadding: 8,
      lineColor: PDF_COLORS.BORDER,
      lineWidth: 0.1,
      overflow: "linebreak",
      font: "helvetica",
    },
    headStyles: {
      fillColor: PDF_COLORS.PRIMARY,
      textColor: 255,
      fontSize: 12,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 10,
    },
    columnStyles: {
      0: { cellWidth: 60 }, // Task name
      1: { cellWidth: 40 }, // Project name
      2: { cellWidth: 30, halign: "center" }, // Date - centered
      3: { cellWidth: 25, halign: "right" }, // Duration - right aligned
    },
    alternateRowStyles: {
      fillColor: PDF_COLORS.BACKGROUND_LIGHT,
    },
    tableLineColor: PDF_COLORS.BORDER,
    tableLineWidth: 0.1,
    margin: { top: 5, right: margin, bottom: 5, left: margin },
    didDrawPage: (data: any) => {
      // Use a type assertion to access getNumberOfPages
      const pageCount = (doc.internal as any).getNumberOfPages();
      drawPageHeader(doc, margin, pageWidth, pageCount);
    },
  });
}

/**
 * Draws the page header on each page
 */
function drawPageHeader(
  doc: jsPDF,
  margin: number,
  pageWidth: number,
  pageNumber: number,
): void {
  // Header on each page
  doc.setFillColor(
    PDF_COLORS.PRIMARY[0],
    PDF_COLORS.PRIMARY[1],
    PDF_COLORS.PRIMARY[2],
  );
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(
    PDF_COLORS.WHITE[0],
    PDF_COLORS.WHITE[1],
    PDF_COLORS.WHITE[2],
  );
  doc.text("HELLOSPACE", margin, 15);

  doc.setFontSize(10);
  doc.text("Time Tracking", margin, 22);

  // Page number
  doc.setFontSize(10);
  doc.setTextColor(
    PDF_COLORS.WHITE[0],
    PDF_COLORS.WHITE[1],
    PDF_COLORS.WHITE[2],
  );
  doc.text(`Sayfa ${pageNumber}`, pageWidth - margin, 15, { align: "right" });
}

/**
 * Draws the footer section of the PDF
 */
function drawFooter(
  doc: jsPDF,
  margin: number,
  pageWidth: number,
  finalY: number,
): void {
  // Footer separator
  doc.setDrawColor(
    PDF_COLORS.BORDER[0],
    PDF_COLORS.BORDER[1],
    PDF_COLORS.BORDER[2],
  );
  doc.setLineWidth(0.3);
  doc.line(margin, finalY - 10, pageWidth - margin, finalY - 10);

  // Company info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(
    PDF_COLORS.TEXT_MUTED[0],
    PDF_COLORS.TEXT_MUTED[1],
    PDF_COLORS.TEXT_MUTED[2],
  );
  doc.text("© Hellospace Time Tracking", margin, finalY);

  // Website
  doc.text("www.hellospace.world", pageWidth - margin, finalY, {
    align: "right",
  });
}
