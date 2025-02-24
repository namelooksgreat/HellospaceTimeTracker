import { TimeEntry } from "./index";

export interface ExportData {
  customerName: string;
  timeRange: string;
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
  entries: TimeEntry[];
}
