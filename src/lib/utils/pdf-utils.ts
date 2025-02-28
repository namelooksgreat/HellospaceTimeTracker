// PDF utilities for handling Turkish characters and other PDF-related functions

/**
 * Converts Turkish characters to their ASCII equivalents for PDF compatibility
 * This is necessary because standard PDF fonts don't support Turkish characters
 *
 * @param text The text containing Turkish characters
 * @returns Text with Turkish characters replaced with ASCII equivalents
 */
// Cache for frequently used Turkish character conversions
const conversionCache: Record<string, string> = {};

export function convertTurkishCharacters(text: string): string {
  if (!text) return "";

  // Check if we've already converted this text
  if (conversionCache[text]) {
    return conversionCache[text];
  }

  // Map of Turkish characters to their ASCII equivalents
  const turkishCharMap: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  // Replace all Turkish characters with their ASCII equivalents
  const result = text.replace(
    /[çÇğĞıİöÖşŞüÜ]/g,
    (match) => turkishCharMap[match] || match,
  );

  // Cache the result for future use
  conversionCache[text] = result;

  return result;
}

/**
 * Processes all text in an array for PDF compatibility
 *
 * @param items Array of strings to process
 * @returns Array with processed strings
 */
export function processPdfTextArray(items: string[]): string[] {
  return items.map((item) => convertTurkishCharacters(item));
}

/**
 * Creates a safe filename for PDF export by removing special characters
 *
 * @param filename The original filename
 * @returns A safe filename for PDF export
 */
export function createSafePdfFilename(filename: string): string {
  if (!filename) return "Musteri";

  // First convert Turkish characters
  const convertedName = convertTurkishCharacters(filename);

  // Then remove any characters that might cause issues in filenames
  return convertedName
    .replace(/[\\/:*?"<>|]/g, "_") // Replace invalid filename characters
    .replace(/\s+/g, "_"); // Replace spaces with underscores
}
