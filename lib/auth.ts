// /home/bukhari/work/PageRoastAI/lib/auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { env } from "@/shared/config/env";

/**
 * Better Auth configuration.
 * Uses core emailAndPassword and emailVerification settings (v1.x syntax).
 */
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            firstName: { type: "string", required: true },
            lastName: { type: "string", required: true },
            isAdmin: { type: "boolean", defaultValue: false },
            package: { type: "string", required: false },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: false,
        async sendResetPassword({ user, url }: { user: { email: string }; url: string }) {
            const result = await sendEmail(
                user.email,
                "Reset your password",
                `<p>You requested a password reset. Click the link below to set a new password:</p>
                 <p><a href="${url}">${url}</a></p>
                 <p>This link will expire in 1 hour.</p>`
            );
            console.log("Password reset email sent to", user.email);
            if (result.error) {
                throw new Error(`Failed to send reset email: ${result.error}`);
            }
        },
        password: {
            hash: async (password: string) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ password, hash }: { password: string; hash: string }) => {
                return await bcrypt.compare(password, hash);
            },
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url }: { user: { email: string }; url: string }) {
            const result = await sendEmail(
                user.email,
                "Verify your email",
                `<p>Welcome to PageRoastAI! Please verify your email address by clicking the link below:</p>
                 <p><a href="${url}">${url}</a></p>`
            );
            console.log("Verification email sent to", user.email);
            if (result.error) {
                throw new Error(`Failed to send verification email: ${result.error}`);
            }
        },
    },

    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            mapProfileToUser: (profile: any) => {
                return {
                    firstName: profile.given_name || profile.name?.split(" ")[0] || "User",
                    lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "",
                }
            }
        },
    },
    hooks: {
        // Use 'before' hook to intercept sign-in and check for account lockout
        before: async (context: any) => {
            const { request } = context;
            // Added safety check for request to prevent crashes on internal calls
            if (request && request.method === "POST" && request.url?.includes("/sign-in/email")) {
                try {
                    const clonedReq = request.clone();
                    const body = await clonedReq.json();
                    const email = body.email;

                    if (email) {
                        const user = await prisma.user.findUnique({
                            where: { email },
                            select: { failedPasswordAttempts: true, lockedUntil: true },
                        });

                        if (user && user.failedPasswordAttempts >= 5 && user.lockedUntil && user.lockedUntil > new Date()) {
                            return {
                                response: new Response(
                                    JSON.stringify({ message: "Account locked. Try again later." }),
                                    { status: 423, headers: { "Content-Type": "application/json" } }
                                ),
                            };
                        }
                    }
                } catch (error) {
                    // Skip check if body is not accessible or invalid
                }
            }
        },
    },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL as string],
});

export type Auth = typeof auth;
