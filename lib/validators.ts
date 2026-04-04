import { z } from "zod";

import {
  MIN_PASSWORD_LENGTH,
  MIN_SIGNUP_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
} from "@/constants";

// ─── Field Utilities ─────────────────────────────────────────────────────────

export function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val.startsWith("http") ? val : "https://" + val);
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

// ─── Zod Schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

export const signupSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`),
  email: z.string().email("Invalid email format"),
  password: z.string().min(MIN_SIGNUP_PASSWORD_LENGTH, `Password must be at least ${MIN_SIGNUP_PASSWORD_LENGTH} characters`),
});

export const waitlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export const paymentSchema = z.object({
  name: z.string().min(1, "Cardholder name is required"),
  card: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry format: MM/YY"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3-4 digits"),
});

// ─── Legacy Wrappers (Optional, for backward compatibility) ──────────────────

export type FormErrors = Record<string, string>;

export function validateLoginForm(email: string, password: string): FormErrors {
  const result = loginSchema.safeParse({ email, password });
  if (result.success) return {};
  const errors: FormErrors = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) errors[err.path[0]] = err.message;
  });
  return errors;
}

export function validateSignupForm(
  name: string,
  email: string,
  password: string
): FormErrors {
  const result = signupSchema.safeParse({ name, email, password });
  if (result.success) return {};
  const errors: FormErrors = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) errors[err.path[0]] = err.message;
  });
  return errors;
}

export function validateWaitlistForm(name: string, email: string): FormErrors {
  const result = waitlistSchema.safeParse({ name, email });
  if (result.success) return {};
  const errors: FormErrors = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) errors[err.path[0]] = err.message;
  });
  return errors;
}

export function validatePaymentForm(
  name: string,
  card: string,
  expiry: string,
  cvc: string
): FormErrors {
  const cardClean = card.replace(/\s/g, "");
  const result = paymentSchema.safeParse({ name, card: cardClean, expiry, cvc });
  if (result.success) return {};
  const errors: FormErrors = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) errors[err.path[0]] = err.message;
  });
  return errors;
}
