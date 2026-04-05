"use server";

import { z } from "zod";
import { loginSchema } from "@/lib/validators";

import { setSession, clearSession } from "@/lib/session";

// Mock credentials for demo purposes
const ADMIN_EMAILS = ["admin@pageroast.com", "bukhari@pageroast.com"];
const DEMO_PASSWORD = "password123";

export async function loginAction(formData: any) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return { data: null, error: "Validation failed" };
  }

  const { email, password } = result.data;

  // Verify password (in a real app, use bcrypt/argon2)
  if (password !== DEMO_PASSWORD) {
    return { data: null, error: "Invalid email or password" };
  }

  // Derive role based on allowlist, not prefix spoofing
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  
  const mockUser = {
    name: isAdmin ? "Admin User" : "Alex Kim",
    email: email,
    role: isAdmin ? "admin" : ("user" as const),
    plan: isAdmin ? ("agency" as const) : ("free" as const),
    auditsUsed: isAdmin ? 0 : 2,
  } as const;

  await setSession(mockUser);
  return { data: mockUser, error: null };
}

export async function adminLoginAction(formData: any) {
  const { data, error } = await loginAction(formData);
  
  if (error) return { data: null, error };
  if (data && data.role !== "admin") {
    // Crucial: clear the session if they tried to log in as a user on the admin portal
    await clearSession();
    return { data: null, error: "Unauthorized. Admin access only." };
  }

  return { data, error: null };
}

export async function signupAction(formData: any) {
  // Reuse login schema for simplicity in mock
  const result = loginSchema.safeParse(formData);
  const mockUser = {
    name: formData.name || "New User",
    email: formData.email || "new@example.com",
    role: ("user" as const),
    plan: ("free" as const),
    auditsUsed: 0,
  } as const;

  await setSession(mockUser);
  return { data: mockUser, error: null };
}

export async function logoutAction() {
  await clearSession();
  return { data: true, error: null };
}
