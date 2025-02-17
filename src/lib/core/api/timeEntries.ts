import { ApiClient } from "./apiClient";
import { TimeEntry } from "@/types";

export class TimeEntriesApi {
  static async getAll(userId: string): Promise<TimeEntry[]> {
    return ApiClient.get<TimeEntry>("time_entries", {
      select: `
        *,
        project:projects!left(id, name, color, customer:customers!left(
          id, name, customer_rates(hourly_rate, currency)
        ))
      `,
      where: { user_id: userId },
    });
  }

  static async create(data: Partial<TimeEntry>): Promise<TimeEntry> {
    return ApiClient.create<TimeEntry>("time_entries", {
      ...data,
      created_at: new Date().toISOString(),
    });
  }

  static async update(
    id: string,
    data: Partial<TimeEntry>,
  ): Promise<TimeEntry> {
    return ApiClient.update<TimeEntry>("time_entries", id, data);
  }

  static async delete(id: string): Promise<void> {
    return ApiClient.delete("time_entries", id);
  }
}
