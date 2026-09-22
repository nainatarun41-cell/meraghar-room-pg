import { AMENITIES, FURNISHING_OPTIONS, PROPERTY_TYPES } from "@/lib/constants";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Indian 10-digit mobile (also accepts +91 / 0 prefix). */
export const PHONE_RE = /^(?:\+?91[- ]?|0)?[6-9]\d{9}$/;
export const PINCODE_RE = /^\d{6}$/;

export type FieldErrors = Record<string, string>;

export function isRequired(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isNumber(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

export function isPositiveNumber(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

export function maxLen(value: string | undefined | null, max: number): boolean {
  return !value || value.trim().length <= max;
}

/** Possibly-a-real-image file types. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_COUNT = 10;

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, WEBP, GIF or AVIF images are allowed.";
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`;
  }
  return null;
}

/** Validate the add/edit property form fields. */
export function validatePropertyForm(
  data: Record<string, string | string[] | undefined>
): FieldErrors {
  const errors: FieldErrors = {};

  const text = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");

  if (!isRequired(text("title"))) errors.title = "Title is required";
  else if (!maxLen(text("title"), 80)) errors.title = "Title must be under 80 characters";

  if (!isRequired(text("description"))) errors.description = "Description is required";
  else if (!maxLen(text("description"), 5000)) errors.description = "Description is too long";

  if (text("purpose") !== "rent" && text("purpose") !== "sale")
    errors.purpose = "Choose Rent or Sale";

  if (!PROPERTY_TYPES.includes(text("property_type") as never))
    errors.property_type = "Choose a property type";

  if (!isRequired(text("city"))) errors.city = "City is required";

  if (!isRequired(text("price"))) errors.price = "Price is required";
  else if (!isPositiveNumber(text("price"))) errors.price = "Enter a valid price";

  if (!isRequired(text("rent_period"))) errors.rent_period = "Rent period is required";

  if (text("security_deposit") && !isNumber(text("security_deposit")))
    errors.security_deposit = "Enter a valid deposit amount";

  if (text("bhk") && Number(text("bhk")) < 0) errors.bhk = "Enter a valid BHK";

  if (text("bathrooms") && !isNumber(text("bathrooms")))
    errors.bathrooms = "Enter a valid number of bathrooms";

  const furnishing = text("furnishing") as never;
  if (!FURNISHING_OPTIONS.some((o) => o.value === furnishing))
    errors.furnishing = "Choose a furnishing option";

  if (text("area_sqft") && !isNumber(text("area_sqft")))
    errors.area_sqft = "Enter a valid area";

  if (text("pincode") && !PINCODE_RE.test(text("pincode").replace(/\s/g, "")))
    errors.pincode = "Pincode should be 6 digits";

  const amenities = Array.isArray(data.amenities) ? data.amenities : [];
  for (const amenity of amenities) {
    if (typeof amenity !== "string" || amenity.length > 40) {
      errors.amenities = "Invalid amenities values";
      break;
    }
  }
  if (amenities.length > 20) errors.amenities = "Too many amenities";

  return errors;
}

/** Validate requirement post fields. */
export function validateRequirementForm(
  data: Record<string, string | undefined>
): FieldErrors {
  const errors: FieldErrors = {};
  const text = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");

  if (!isRequired(text("city"))) errors.city = "City is required";

  if (text("purpose") !== "rent" && text("purpose") !== "sale")
    errors.purpose = "Choose Rent or Sale";

  if (!isRequired(text("property_type"))) errors.property_type = "Property type is required";

  if (!isRequired(text("description")))
    errors.description = "Describe what you are looking for";
  else if (!maxLen(text("description"), 2000)) errors.description = "Description is too long";

  if (text("budget_min") && !isPositiveNumber(text("budget_min")))
    errors.budget_min = "Enter a valid minimum budget";

  if (text("budget_max") && !isPositiveNumber(text("budget_max")))
    errors.budget_max = "Enter a valid maximum budget";

  const min = Number(text("budget_min") || 0);
  const max = Number(text("budget_max") || 0);
  if (min > 0 && max > 0 && min > max) errors.budget_max = "Max budget must exceed min budget";

  const pref = text("contact_preference");
  if (pref !== "call" && pref !== "whatsapp" && pref !== "both")
    errors.contact_preference = "Choose a contact preference";

  return errors;
}

/** Validate profile update fields. */
export function validateProfileForm(data: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};

  if (!isRequired(data.name)) errors.name = "Name is required";
  else if (!maxLen(data.name, 60)) errors.name = "Name must be under 60 characters";

  if (!isRequired(data.phone)) errors.phone = "Phone is required";
  else if (!PHONE_RE.test(data.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number";

  if (!isRequired(data.email)) errors.email = "Email is required";
  else if (!EMAIL_RE.test(data.email)) errors.email = "Enter a valid email address";

  return errors;
}

export const AMENITIES_SAFE = AMENITIES;