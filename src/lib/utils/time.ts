import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatDate = (date: string): string => {
  return format(new Date(date), "d MMM yyyy", { locale: tr });
};

export const formatStartTime = (startTime: string): string => {
  const date = new Date(startTime);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatTimeAgo = (date: string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
