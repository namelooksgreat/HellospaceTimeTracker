/**
 * HTML-based PDF Generator
 * Uses HTML and CSS to create beautiful PDF reports with full Turkish character support
 */
// Mock puppeteer for browser environments
const puppeteer = async () => {
  throw new Error("Puppeteer is not available in browser environments");
};
import { ExportData } from "@/types/export";
import { formatDuration, formatCurrency } from "./common";

/**
 * Generates a PDF using HTML and CSS via Puppeteer
 * This provides much better styling capabilities and full Unicode support
 */
export const generatePDFFromHTML = async (
  data: ExportData,
): Promise<Uint8Array> => {
  // This is a stub implementation for browser environments
  // In browser environments, we'll always use the jsPDF fallback
  throw new Error(
    "Puppeteer PDF generation is not available in browser environments",
  );
};

/**
 * Generates the HTML content for the PDF report
 * This is now imported from html-preview.ts to maintain consistency
 */
import { generateHTMLPreview } from "./html-preview";

function generateReportHTML(data: ExportData): string {
  return generateHTMLPreview(data);
  // We now use the shared HTML template from html-preview.ts
}
