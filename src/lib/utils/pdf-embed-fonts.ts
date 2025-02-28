/**
 * Font embedding utility for PDF generation
 * Simplified to use default fonts instead of embedding custom fonts
 */
import { jsPDF } from "jspdf";

/**
 * Sets default fonts for the PDF document
 * @param doc jsPDF document instance
 * @returns The same document with default fonts set
 */
export const embedFonts = (doc: jsPDF): jsPDF => {
  // Use helvetica as the default font
  doc.setFont("helvetica");
  return doc;
};
