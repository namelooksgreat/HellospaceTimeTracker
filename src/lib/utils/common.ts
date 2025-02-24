import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Ortak utility fonksiyonları
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDuration = (seconds: number): string => {
  const duration = typeof seconds === "number" ? Math.max(0, seconds) : 0;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString();
};

export const formatCurrency = (amount: number, currency: string = "TRY") => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amount);
};
