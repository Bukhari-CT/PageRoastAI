import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { User } from "@/types";
import { env } from "@/shared/config/env";
import { userSchema } from "./validators";

const SESSION_COOKIE = "pageroast_session";

function sign(payload: string): string {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(payload).digest("hex");
}

export async function setSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const payload = Buffer.from(JSON.stringify(user)).toString("base64");
  const signature = sign(payload);
  const session = `${payload}.${signature}`;
  
  (await cookies()).set(SESSION_COOKIE, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<User | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return null;
  
  // Verify signature
  const expectedSignature = sign(payload);
  try {
    const verified = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!verified) return null;
  } catch (error) {
    return null;
  }

  try {
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    const json = JSON.parse(decoded);
    const result = userSchema.safeParse(json);
    
    if (!result.success) return null;
    return result.data as User;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
