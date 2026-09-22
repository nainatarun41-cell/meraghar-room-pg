/**
 * Build a wa.me deep-link from a phone number without using the WhatsApp API.
 * Handles common Indian number formats.
 */
export function toWhatsAppNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");

  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits;
  }
  return digits;
}

export function whatsappLink(
  phone: string | null | undefined,
  message: string
): string | null {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `tel:+${digits}`;
}