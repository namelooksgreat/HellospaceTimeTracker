import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

// Add type declaration for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}
import { TimeEntry } from "@/types";

// Import the ExportData type from types/export.ts
import { ExportData } from "@/types/export";

// Import the exportToPDF function from export-html-pdf.ts
import { exportToPDF as exportToPDFImpl } from "./export-html-pdf";

export const exportToPDF = (data: ExportData) => {
  // Handle both userName and customerName for backward compatibility
  const name = data.customerName || data.userName || "";

  // Ensure all entries have tags property
  const entriesWithTags = data.entries.map((entry) => ({
    ...entry,
    tags: entry.tags || [],
  }));

  // Use the implementation from export-pdf.ts
  return exportToPDFImpl({
    ...data,
    customerName: name,
    entries: entriesWithTags,
  });
};

export const exportToExcel = async (data: ExportData): Promise<void> => {
  try {
    console.log("Starting Excel export with data:", data);

    // Ensure all entries have tags property
    const dataWithTags = {
      ...data,
      entries: data.entries.map((entry) => ({
        ...entry,
        tags: entry.tags || [],
      })),
    };

    const workbook = new ExcelJS.Workbook();

    // Get the name (either userName or customerName)
    const name = data.customerName || data.userName || "";
    console.log("Using name for export:", name);

    // Summary Sheet
    const periodText =
      {
        daily: "Bugün",
        weekly: "Bu Hafta",
        monthly: "Bu Ay",
        yearly: "Bu Yıl",
      }[data.timeRange] || data.timeRange;

    // Create a more visually appealing summary sheet
    const summarySheet = workbook.addWorksheet("Özet", {
      properties: { tabColor: { argb: "2980B9" } },
    });
    console.log("Created summary sheet");

    // Add a title with better styling
    summarySheet.addRow([]);
    const titleRow = summarySheet.addRow([`${name} - Zaman Raporu`]);
    titleRow.font = { bold: true, size: 16, color: { argb: "2980B9" } };
    titleRow.height = 24;

    // Add some spacing
    summarySheet.addRow([]);
    summarySheet.addRow([]);

    // Add summary data with better organization
    const infoRows = [
      ["customerName" in data ? "Müşteri" : "Kullanıcı", name],
      ["Dönem", periodText],
      ["Toplam Süre", formatDuration(data.totalDuration)],
      ["Toplam Kazanç", `${data.totalEarnings.toFixed(2)} ${data.currency}`],
      ["Saatlik Ücret", `${data.hourlyRate} ${data.currency}`],
    ];

    // Add data with better styling
    infoRows.forEach((rowData, index) => {
      const row = summarySheet.addRow(rowData);
      row.getCell(1).font = { bold: true };
      row.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F5F7FA" },
      };
      row.getCell(1).border = {
        right: { style: "thin", color: { argb: "E5E8EB" } },
      };

      // Highlight total earnings row
      if (index === 3) {
        row.getCell(2).font = { bold: true, color: { argb: "2980B9" } };
      }

      row.height = 20;
    });

    // Style summary sheet with better spacing
    summarySheet.getColumn(1).width = 20;
    summarySheet.getColumn(2).width = 40;
    summarySheet.mergeCells("A2:B2");

    // Add company info at bottom
    summarySheet.addRow([]);
    summarySheet.addRow([]);
    const footerRow = summarySheet.addRow(["© Hellospace Time Tracking"]);
    footerRow.font = { italic: true, color: { argb: "808080" } };
    summarySheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
    console.log("Completed summary sheet");

    // Entries Sheet with better organization
    const entriesSheet = workbook.addWorksheet("Zaman Kayıtları", {
      properties: { tabColor: { argb: "2980B9" } },
    });
    console.log("Created entries sheet");

    // Add headers with better styling
    entriesSheet.columns = [
      { header: "Kullanıcı", key: "user", width: 30 },
      { header: "Tarih", key: "date", width: 15 },
      { header: "Görev", key: "task", width: 40 },
      { header: "Etiketler", key: "tags", width: 30 },
      { header: "Proje", key: "project", width: 30 },
      { header: "Süre", key: "duration", width: 15 },
    ];

    // Style the header row with more professional look
    const entriesHeaderRow = entriesSheet.getRow(1);
    entriesHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
    entriesHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2980B9" },
    };
    entriesHeaderRow.height = 22;

    // Add border to header
    entriesHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Group entries by user
    const entriesByUser: Record<string, typeof data.entries> = {};
    console.log(`Processing ${data.entries.length} entries`);

    data.entries.forEach((entry) => {
      const userName = (entry as any).user_name || entry.user_id || "-";
      if (!entriesByUser[userName]) {
        entriesByUser[userName] = [];
      }
      entriesByUser[userName].push(entry);
    });

    // Add data rows with user grouping
    Object.entries(entriesByUser).forEach(([userName, userEntries]) => {
      // Calculate user totals
      const userTotalDuration = userEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0,
      );

      // Add user header row with total and better styling
      const headerRow = entriesSheet.addRow({
        user: `${userName}`,
        date: "",
        task: "",
        tags: "",
        project: "",
        duration: `Toplam: ${formatDuration(userTotalDuration)}`,
      });

      // Style the user header row with more visual distinction
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: "2B5797" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "DCF0FF" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "B3D7FF" } },
          left:
            colNumber === 1
              ? { style: "thick", color: { argb: "2980B9" } }
              : { style: "thin", color: { argb: "B3D7FF" } },
          bottom: { style: "thin", color: { argb: "B3D7FF" } },
          right: { style: "thin", color: { argb: "B3D7FF" } },
        };
        cell.alignment = { vertical: "middle" };
      });

      // Set row height for better visibility
      headerRow.height = 24;

      // Add user entries
      userEntries.forEach((entry) => {
        // Get task name and tags separately
        const taskDisplay = entry.task_name;
        const tagNames =
          entry.tags && entry.tags.length > 0
            ? entry.tags.map((tag) => tag.name).join(", ")
            : "-";

        const entryRow = entriesSheet.addRow({
          user: "", // Leave blank as we have the user header
          date: new Date(entry.start_time).toLocaleDateString("tr-TR"),
          task: taskDisplay,
          tags: tagNames,
          project: entry.project?.name || "-",
          duration: formatDuration(entry.duration),
        });

        // Style the entry row
        entryRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin", color: { argb: "E5E8EB" } },
            left: { style: "thin", color: { argb: "E5E8EB" } },
            bottom: { style: "thin", color: { argb: "E5E8EB" } },
            right: { style: "thin", color: { argb: "E5E8EB" } },
          };

          // Center date column
          if (colNumber === 2) {
            // date column
            cell.alignment = { horizontal: "center" };
          }

          // Style tags column
          if (colNumber === 4) {
            // tags column
            cell.alignment = { horizontal: "left" };
            if (cell.value && cell.value !== "-") {
              cell.font = { color: { argb: "0066CC" } };
            }
          }

          // Right-align duration column
          if (colNumber === 6) {
            // duration column
            cell.alignment = { horizontal: "right" };
          }
        });
      });
    });

    // Add alternating row colors with subtle styling
    // We now apply styles directly when adding rows, so this loop is simplified
    for (let i = 2; i <= entriesSheet.rowCount; i++) {
      const row = entriesSheet.getRow(i);

      // Alternate row colors (only for non-header rows)
      if (i % 2 === 0 && !row.getCell(1).font?.bold) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F5F7FA" },
        };
      }
    }

    console.log("Completed entries sheet");

    // Create a safe filename
    const safeName = name ? name.replace(/[\\/:*?"<>|]/g, "_") : "Musteri";
    const safePeriod = periodText
      ? periodText.replace(/[\\/:*?"<>|]/g, "_")
      : "Rapor";
    const filename = `${safeName}_${safePeriod}_Raporu.xlsx`;
    console.log(`Saving Excel file as: ${filename}`);

    // Save workbook
    await workbook.xlsx.writeBuffer().then((buffer) => {
      // Create a Blob from the buffer
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    });

    console.log("Excel export completed successfully");
  } catch (error) {
    console.error("Excel export error:", error);
    throw error;
  }
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
