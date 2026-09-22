/**
 * Server-only feature flags and payment pricing. All secrets stay in env
 * vars; prices are never hardcoded in components.
 */

const isTrue = (value: string | undefined) => value === "true";

/** When false, contact details are revealed for free (free launch period). */
export function isContactPaymentsEnabled(): boolean {
  return isTrue(process.env.ENABLE_CONTACT_REVEAL_PAYMENT);
}

/** When false, the "featured listing" purchase is hidden. */
export function isFeaturedListingsEnabled(): boolean {
  return isTrue(process.env.ENABLE_FEATURED_LISTINGS);
}

/** Razorpay credentials + config present. */
export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

const num = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export interface PaymentPrices {
  contactReveal: number;
  featured7Days: number;
  featured30Days: number;
}

/** Returns the current (server-side) prices in INR. */
export function getPaymentPrices(): PaymentPrices {
  return {
    contactReveal: num(process.env.CONTACT_REVEAL_PRICE, 199),
    featured7Days: num(process.env.FEATURED_PRICE_7_DAYS, 99),
    featured30Days: num(process.env.FEATURED_PRICE_30_DAYS, 249),
  };
}

export const FEATURED_DAYS_OPTIONS = [7, 30] as const;
export type FeaturedDays = (typeof FEATURED_DAYS_OPTIONS)[number];

export function featuredPriceForDays(days: FeaturedDays): number {
  const prices = getPaymentPrices();
  return days === 7 ? prices.featured7Days : prices.featured30Days;
}

export const CONTACT_REVEAL_TXN_TYPE = "contact_reveal";
export const FEATURED_TXN_TYPE = "featured_listing";