/**
 * HTML Preview Generator for Reports
 * Creates an HTML preview that can be displayed before generating a PDF
 */
import { ExportData } from "@/types/export";
import { formatDuration, formatCurrency } from "./common";

// Reusable CSS styles for the report
const reportStyles = `
  /* Modern typography using system fonts */
  :root {
    --primary: hsl(210, 100%, 50%);
    --primary-foreground: hsl(0, 0%, 100%);
    --muted: hsl(210, 20%, 92%);
    --muted-foreground: hsl(215, 16%, 47%);
    --border: hsl(214, 32%, 91%);
    --background: hsl(0, 0%, 100%);
    --card: hsl(210, 40%, 98%);
    --radius: 0.5rem;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: hsl(222, 47%, 11%);
    line-height: 1.6;
    background-color: var(--background);
  }
  
  /* Header styles */
  .header {
    background: linear-gradient(135deg, hsl(210, 100%, 50%), hsl(210, 100%, 40%));
    color: var(--primary-foreground);
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }
  
  .header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%);
    background-size: 20px 20px;
    opacity: 0.3;
  }
  
  .header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    position: relative;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .header .tagline {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-top: 0.25rem;
    font-weight: 500;
  }
  
  .header .date {
    font-size: 0.875rem;
    text-align: right;
    background: rgba(255,255,255,0.15);
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    backdrop-filter: blur(4px);
  }
  
  /* Content container */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
  }
  
  /* Report title */
  .report-title {
    margin: 1.5rem 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 800;
    color: hsl(222, 47%, 11%);
    letter-spacing: -0.025em;
    background: linear-gradient(to right, hsl(210, 100%, 50%), hsl(250, 100%, 60%));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  .report-subtitle {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
    color: var(--muted-foreground);
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: hsl(210, 50%, 95%);
    border-radius: 1rem;
  }
  
  /* Card component */
  .card {
    background-color: var(--card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    margin-bottom: 1.5rem;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .card-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(to right, hsl(210, 50%, 98%), hsl(210, 50%, 95%));
    position: relative;
  }
  
  .card-header::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, hsl(210, 100%, 50%), hsl(250, 100%, 60%));
  }
  
  .card-title {
    color: var(--primary);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-left: 0.5rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  /* Summary grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .summary-item {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: hsl(210, 50%, 98%);
    border-radius: 0.5rem;
    border: 1px solid hsl(210, 40%, 93%);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .summary-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .summary-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .summary-label::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    background-color: var(--primary);
    border-radius: 50%;
  }
  
  .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    letter-spacing: -0.025em;
  }
  
  .summary-subtext {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: hsl(210, 50%, 95%);
    border-radius: 0.25rem;
    display: inline-block;
  }
  
  /* Table styles */
  .table-container {
    overflow-x: auto;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--border);
  }
  
  thead {
    background: linear-gradient(to right, hsl(210, 100%, 50%), hsl(210, 100%, 40%));
    color: var(--primary-foreground);
  }
  
  th {
    text-align: left;
    padding: 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.875rem;
  }
  
  tr:nth-child(even):not(.user-group-header) {
    background-color: hsl(210, 50%, 98%);
  }
  
  tr:hover:not(.user-group-header):not(thead tr) {
    background-color: hsl(210, 50%, 95%);
  }
  
  /* User group styling */
  .user-group-header {
    background: linear-gradient(to right, hsl(210, 50%, 95%), hsl(210, 50%, 98%));
    position: relative;
    border-top: 2px solid var(--primary);
  }
  
  .user-group-header td {
    padding: 1.25rem 1rem;
    font-weight: 700;
  }
  
  .user-group-header::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: linear-gradient(to bottom, hsl(210, 100%, 50%), hsl(250, 100%, 60%));
  }
  
  .user-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .user-total {
    font-weight: 500;
    color: var(--primary);
    font-size: 0.875rem;
    margin-left: 0.75rem;
    background-color: hsl(210, 50%, 90%);
    padding: 0.35rem 0.75rem;
    border-radius: 1rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 4rem 1.5rem;
    color: var(--muted-foreground);
    background-color: hsl(210, 50%, 98%);
    border-radius: 0.5rem;
  }
  
  .empty-state-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: hsl(210, 50%, 40%);
  }
  
  .empty-state-description {
    font-size: 0.875rem;
    opacity: 0.8;
    max-width: 24rem;
    margin: 0 auto;
  }
  
  /* Footer */
  .footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  
  .footer div:first-child {
    font-weight: 500;
  }
  
  .highlight {
    color: var(--primary);
    font-weight: 700;
  }
  
  @media print {
    .card, .table-container {
      box-shadow: none !important;
      break-inside: avoid;
    }
    
    .card:hover, .summary-item:hover {
      transform: none !important;
      box-shadow: none !important;
    }
    
    .header {
      background: var(--primary) !important;
    }
    
    .report-title {
      color: var(--primary) !important;
      -webkit-text-fill-color: var(--primary) !important;
      text-fill-color: var(--primary) !important;
    }
  }
`;

/**
 * Generates HTML content for preview before PDF generation
 * @param data The data to export
 * @returns HTML string that can be displayed in a preview container
 */
export const generateHTMLPreview = (data: ExportData): string => {
  const {
    customerName,
    timeRange,
    totalDuration,
    totalEarnings,
    currency,
    hourlyRate,
    entries,
  } = data;

  // Group entries by user
  const entriesByUser: Record<string, typeof entries> = {};

  entries.forEach((entry) => {
    const userName = entry.user_name || entry.user_id || "-";
    if (!entriesByUser[userName]) {
      entriesByUser[userName] = [];
    }
    entriesByUser[userName].push(entry);
  });

  // Create entries HTML grouped by user
  const entriesHTML = Object.entries(entriesByUser)
    .map(([userName, userEntries]) => {
      // Calculate user totals
      const userTotalDuration = userEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0,
      );

      // Create rows for this user's entries
      const userEntriesHTML = userEntries
        .map((entry) => {
          return `
      <tr>
        <td>${entry.task_name}</td>
        <td>${entry.project?.name || "-"}</td>
        <td class="text-center">${new Date(entry.start_time).toLocaleDateString("tr-TR")}</td>
        <td class="text-right">${formatDuration(entry.duration)}</td>
      </tr>
      `;
        })
        .join("");

      // Return user group with header and entries
      return `
      <tr class="user-group-header">
        <td colspan="4" class="user-name">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <strong>${userName}</strong>
            <span class="user-total">Toplam: ${formatDuration(userTotalDuration)}</span>
          </div>
        </td>
      </tr>
      ${userEntriesHTML}
    `;
    })
    .join("");

  // Return complete HTML document
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${customerName || "Müşteri"} Raporu</title>
      <style>${reportStyles}</style>
    </head>
    <body>
      <div class="header">
        <div>
          <img src="/logo-admin-white.png" alt="Hellospace Tracker" class="h-8 w-auto" style="height: 32px; width: auto;"/>
          <div class="tagline">Time Tracking</div>
        </div>
        <div class="date">${new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      
      <div class="container">
        <h2 class="report-title">${customerName || "Müşteri"} Raporu</h2>
        <p class="report-subtitle">Dönem: ${timeRange}</p>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">ÖZET BİLGİLER</h3>
          </div>
          <div class="card-content">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Müşteri</div>
                <div class="summary-value">${customerName || "Müşteri"}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Saatlik Ücret</div>
                <div class="summary-value">${formatCurrency(hourlyRate, currency)}/saat</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Toplam Süre</div>
                <div class="summary-value">${formatDuration(totalDuration)}</div>
                <div class="summary-subtext">${timeRange} için toplam</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Toplam Tutar</div>
                <div class="summary-value highlight">${formatCurrency(totalEarnings, currency)}</div>
                <div class="summary-subtext">${hourlyRate} ${currency}/saat üzerinden</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">ZAMAN KAYITLARI</h3>
          </div>
          <div class="card-content">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Görev</th>
                    <th>Proje</th>
                    <th class="text-center">Tarih</th>
                    <th class="text-right">Süre</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    entries.length > 0
                      ? entriesHTML
                      : `
                  <tr>
                    <td colspan="4">
                      <div class="empty-state">
                        <div class="empty-state-title">Bu dönem için kayıt bulunamadı</div>
                        <div class="empty-state-description">Farklı bir zaman aralığı seçmeyi deneyin</div>
                      </div>
                    </td>
                  </tr>
                  `
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div>© ${new Date().getFullYear()} Hellospace Time Tracking</div>
          <div>www.hellospace.world</div>
        </div>
      </div>
    </body>
    </html>
  `;
};
