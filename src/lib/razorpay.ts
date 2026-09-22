import { createHmac, timingSafeEqual } from "crypto";

/**
 * Razorpay helpers built on raw `fetch` (no SDK dependency).
 * All calls are server-side only — never import into a client component.
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

/** Razorpay is fully configured when key id + secret + webhook secret exist. */
export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret, webhookSecret };
}

const RAZORPAY_API = "https://api.razorpay.com/v1";

function basicAuth(config: RazorpayConfig): string {
  return "Basic " + Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
}

/** Shared error shape so routes can return clean 4xx/5xx messages. */
export interface RazorpayApiError {
  code?: string;
  description?: string;
  source?: string;
}

export async function razorpayRequest<T>(
  config: RazorpayConfig,
  path: string,
  init?: { method?: string; body?: Record<string, unknown> }
): Promise<{ data: T | null; error: RazorpayApiError | null; status: number }> {
  try {
    const res = await fetch(`${RAZORPAY_API}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: basicAuth(config),
        "Content-Type": "application/json",
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
    const json = (await res.json().catch(() => null)) as T | RazorpayApiError | null;
    if (!res.ok) {
      return { data: null, error: (json as RazorpayApiError) ?? { description: `Razorpay ${res.status}` }, status: res.status };
    }
    return { data: json as T, error: null, status: res.status };
  } catch {
    return { data: null, error: { description: "Could not reach Razorpay. Please try again." }, status: 502 };
  }
}

/** Create a Razorpay Order. */
export async function createRazorpayOrder(config: RazorpayConfig, amountPaise: number, receipt: string, notes: Record<string, string> = {}): Promise<{ orderId: string | null; error: RazorpayApiError | null }> {
  const { data, error } = await razorpayRequest<{
    id: string;
    status: string;
    amount: number;
    currency: string;
  }>(config, "/orders", {
    method: "POST",
    body: {
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    },
  });
  if (error || !data) return { orderId: null, error };
  return { orderId: data.id, error: null };
}

/** Fetch a single order (used during webhook reconciliation). */
export async function fetchRazorpayOrder(config: RazorpayConfig, orderId: string): Promise<{ order: { id: string; status: string; amount: number; currency: string } | null; error: RazorpayApiError | null }> {
  const { data, error } = await razorpayRequest<{ id: string; status: string; amount: number; currency: string }>(config, `/orders/${encodeURIComponent(orderId)}`);
  return { order: data, error };
}

/** Verify the Razorpay signature per the documented algorithm. */
export function verifyRazorpaySignature(webhookSecret: string, orderId: string, paymentId: string, signature: string): boolean {
  const payload = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", webhookSecret).update(payload).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
