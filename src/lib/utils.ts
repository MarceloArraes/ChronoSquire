import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatLocalTime = (
  utcDate: Date,
  timeZone = "Australia/Adelaide",
): string => {
  const localDate = toZonedTime(utcDate, timeZone);
  return format(localDate, "HH:mm");
};
