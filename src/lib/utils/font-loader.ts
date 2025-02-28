// Simplified font loader utility for PDF generation
import { jsPDF } from "jspdf";

// Use default fonts instead of loading custom fonts
export const loadFontsForPDF = async (doc: jsPDF): Promise<jsPDF> => {
  // Set default font
  doc.setFont("helvetica");
  return doc;
};
