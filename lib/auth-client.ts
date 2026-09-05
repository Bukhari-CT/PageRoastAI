// /home/bukhari/work/PageRoastAI/lib/auth-client.ts

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

/**
 * Client-side Better Auth client for React components.
 *
 * `inferAdditionalFields` teaches the client about the custom user fields
 * declared on the server (firstName, lastName, isAdmin, package) so calls like
 * `signUp.email` accept them with real types instead of a cast. The `auth`
 * import is type-only and erased at build time — no server code is bundled.
 */
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    plugins: [inferAdditionalFields<typeof auth>()],
});

export const { useSession } = authClient;
