import { TimeEntry } from "./index";

export interface ExportData {
  customerName?: string;
  userName?: string; // For backward compatibility
  timeRange: string;
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
  entries: Array<TimeEntry & { user_email?: string; user_name?: string }>;
}
