import "server-only";
import { cookies } from "next/headers";
import { User } from "@/types";

const SESSION_COOKIE = "pageroast_session";

export async function setSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = Buffer.from(JSON.stringify(user)).toString("base64");
  
  (await cookies()).set(SESSION_COOKIE, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<User | null> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) return null;
  
  try {
    const decoded = Buffer.from(session, "base64").toString("utf-8");
    return JSON.parse(decoded) as User;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
