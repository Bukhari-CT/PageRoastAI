import {
  EMAIL_REGEX,
  CARD_REGEX,
  EXPIRY_REGEX,
  CVC_REGEX,
  MIN_PASSWORD_LENGTH,
  MIN_SIGNUP_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  CARD_NUMBER_LENGTH,
} from "@/constants";
import type { FormErrors } from "@/types";

// ─── Field Validators ────────────────────────────────────────────────────────

export function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val.startsWith("http") ? val : "https://" + val);
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function isValidEmail(val: string): boolean {
  return EMAIL_REGEX.test(val);
}

// ─── Form Validators ────────────────────────────────────────────────────────

export function validateLoginForm(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Invalid email format";
  if (!password) errors.password = "Password is required";
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return errors;
}

export function validateSignupForm(
  name: string,
  email: string,
  password: string
): FormErrors {
  const errors: FormErrors = {};
  if (!name) errors.name = "Name is required";
  else if (name.length < MIN_NAME_LENGTH)
    errors.name = `Name must be at least ${MIN_NAME_LENGTH} characters`;
  if (!email) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Invalid email format";
  if (!password) errors.password = "Password is required";
  else if (password.length < MIN_SIGNUP_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_SIGNUP_PASSWORD_LENGTH} characters`;
  return errors;
}

export function validateWaitlistForm(name: string, email: string): FormErrors {
  const errors: FormErrors = {};
  if (!name) errors.name = "Name is required";
  if (!email) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Invalid email format";
  return errors;
}

export function validatePaymentForm(
  name: string,
  card: string,
  expiry: string,
  cvc: string
): FormErrors {
  const errors: FormErrors = {};
  if (!name) errors.name = "Cardholder name is required";
  const cardClean = card.replace(/\s/g, "");
  if (!cardClean) errors.card = "Card number is required";
  else if (!CARD_REGEX.test(cardClean))
    errors.card = `Card must be ${CARD_NUMBER_LENGTH} digits`;
  if (!expiry) errors.expiry = "Expiry date is required";
  else if (!EXPIRY_REGEX.test(expiry)) errors.expiry = "Format: MM/YY";
  if (!cvc) errors.cvc = "CVC is required";
  else if (!CVC_REGEX.test(cvc)) errors.cvc = "CVC must be 3-4 digits";
  return errors;
}
