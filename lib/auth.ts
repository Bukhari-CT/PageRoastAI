import { betterAuth } from "better-auth";
import bcrypt from "bcryptjs";
import { typeOrmAdapter } from "@infrastructure/Auth/TypeOrmAdapter";
import { AppDataSource } from "@database/DBConnection";
import { sendEmail } from "@services/EmailService";
import { env, isGoogleAuthConfigured } from "@/shared/config/env";

/**
 * Better Auth configuration.
 *
 * Brute-force protection uses Better Auth's built-in rate limiter rather than
 * a custom lockout: the previous `before` hook read `failedPasswordAttempts`
 * and `lockedUntil` columns that no code path ever wrote, so it could never
 * actually lock an account. The rules below are enforced by the library on
 * every request, with no schema or bookkeeping of our own.
 */
export const auth = betterAuth({
    database: typeOrmAdapter(AppDataSource),
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
            if (result.error) {
                throw new Error(`Failed to send verification email: ${result.error}`);
            }
        },
    },

    /**
     * Rate limiting. Enabled in every environment (Better Auth only enables it
     * in production by default) so the limits are exercised during development
     * instead of first meeting real traffic in production.
     *
     * Storage is in-memory, which means limits are per server instance. That is
     * a genuine improvement over no limit at all, but on a serverless target it
     * is weaker than it looks — moving to "database" or a shared store is a
     * deployment-phase task.
     */
    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        customRules: {
            "/sign-in/email": { window: 60, max: 5 },
            "/sign-up/email": { window: 3600, max: 10 },
            "/request-password-reset": { window: 3600, max: 5 },
            "/reset-password": { window: 3600, max: 5 },
            "/send-verification-email": { window: 3600, max: 5 },
            "/change-password": { window: 3600, max: 10 },
        },
    },

    // Registered only when credentials exist, so an unconfigured deployment
    // boots cleanly instead of warning on every request. The matching sign-in
    // button is hidden via `isGoogleAuthConfigured`.
    socialProviders: isGoogleAuthConfigured
        ? {
            google: {
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                mapProfileToUser: (profile: {
                    given_name?: string;
                    family_name?: string;
                    name?: string;
                }) => {
                    return {
                        firstName: profile.given_name || profile.name?.split(" ")[0] || "User",
                        lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "",
                    };
                },
            },
        }
        : {},
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
});

export type Auth = typeof auth;
