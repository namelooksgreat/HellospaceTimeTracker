export const STORAGE_KEYS = {
  THEME: "theme",
  THEME_PREFERENCE: "theme-preference",
  LAST_TASK_NAME: "lastTaskName",
  LAST_DESCRIPTION: "lastDescription",
  SELECTED_PROJECT_ID: "selectedProjectId",
  SELECTED_CUSTOMER_ID: "selectedCustomerId",
  USER_PREFERENCES: "userPreferences",
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set storage item: ${key}`, error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove storage item: ${key}`, error);
  }
}

export function clearStorageExcept(exceptKeys: string[]): void {
  try {
    // Save values of excepted keys
    const savedValues = exceptKeys.reduce<Record<string, string | null>>(
      (acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      },
      {},
    );

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Restore excepted values
    Object.entries(savedValues).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(key, value);
      }
    });
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}
