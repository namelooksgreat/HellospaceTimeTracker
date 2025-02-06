import { supabase } from "../supabase";
import { logger } from "../utils/logger";

type QueryParams = Record<string, string | number | boolean>;

class ApiClient {
  private static instance: ApiClient;
  private retryCount = 3;
  private retryDelay = 1000;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getCacheKey(table: string, params?: QueryParams): string {
    return `${table}:${params ? JSON.stringify(params) : ""}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private async handleRequest<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const { data, error } = await operation();

        if (error) throw error;
        if (!data) throw new Error("No data returned");

        return data as T;
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          `API request failed (attempt ${attempt}/${this.retryCount}):`,
          error,
        );

        if (attempt === this.retryCount) break;

        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempt),
        );
      }
    }

    throw lastError;
  }

  async get<T>(table: string, params?: QueryParams): Promise<T[]> {
    const cacheKey = this.getCacheKey(table, params);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    let query = supabase.from(table).select("*");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const data = await this.handleRequest<T[]>(() => query as any);

    // Update cache
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  async post<T>(table: string, data: Partial<T>): Promise<T> {
    const result = await this.handleRequest<T>(
      () => supabase.from(table).insert([data]).select().single() as any,
    );

    // Invalidate cache for this table
    this.invalidateCache(table);

    return result;
  }

  async put<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const result = await this.handleRequest<T>(
      () =>
        supabase.from(table).update(data).eq("id", id).select().single() as any,
    );

    // Invalidate cache for this table
    this.invalidateCache(table);

    return result;
  }

  async delete(table: string, id: string): Promise<void> {
    await this.handleRequest(
      () => supabase.from(table).delete().eq("id", id) as any,
    );

    // Invalidate cache for this table
    this.invalidateCache(table);
  }

  invalidateCache(table: string): void {
    const prefix = `${table}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const apiClient = ApiClient.getInstance();
