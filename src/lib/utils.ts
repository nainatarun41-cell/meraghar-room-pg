import type { PropertyRow, PropertyType } from "@/types";
import { PROPERTY_TYPE_LABELS, RENT_PERIOD_LABELS } from "@/lib/constants";

/** Join truthy class names. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompactFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** ₹6,000 */
export function formatINR(value: number | string | null | undefined, compact = false): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return compact ? inrCompactFormatter.format(num) : inrFormatter.format(num);
}

/** Price line for a card: "₹6,000/month" or "₹25,00,000" */
export function formatPriceForCard(
  price: number | string | null | undefined,
  purpose: PropertyRow["purpose"],
  rentPeriod: PropertyRow["rent_period"]
): string {
  const base = formatINR(price);
  if (purpose === "rent") {
    const suffix = RENT_PERIOD_LABELS[rentPeriod] ?? "/month";
    return `${base}${suffix}`;
  }
  return base;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

/** "2 days ago" style relative date. */
export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: Array<[number, string]> = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of units) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/** "My 2 BHK Flat" -> "my-2-bhk-flat" */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/['".,!?;:()\[\]{}]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "property";
}

/** Remove control chars and normalize whitespace before storing user input. */
export function cleanText(input: string, maxLength = 5000): string {
  return (input ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Build an SEO url-safe property slug with a short id suffix. */
export function propertySlug(property: { title: string; id: string }): string {
  return `${slugify(property.title)}-${property.id.slice(0, 8)}`;
}

/** Human readable label for a property type value. */
export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

/** the-correct-title-case is a helper for display */
export function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Coerce a possibly-arrayed search param value to a plain string. */
export function strParam(value: string | string[] | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.length > 0 ? value : undefined;
}