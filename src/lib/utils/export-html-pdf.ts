/**
 * HTML-based PDF export implementation
 * Uses Puppeteer to generate PDFs from HTML templates
 * Falls back to jsPDF if Puppeteer fails
 */
import { ExportData } from "@/types/export";
import { generatePDFFromHTML } from "./html-pdf-generator";
import { generatePDFWithJsPDF } from "./pdf-fallback";
import { createSafePdfFilename } from "./pdf-utils";

/**
 * Exports data to a PDF file using HTML templates and Puppeteer
 * This provides much better styling and full Unicode support
 * Falls back to jsPDF if Puppeteer fails
 * @param data The data to export
 */
export const exportToPDF = async (data: ExportData): Promise<void> => {
  try {
    // In browser environments, always use jsPDF fallback
    console.log("Using jsPDF for PDF generation in browser environment");
    generatePDFWithJsPDF(data);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
