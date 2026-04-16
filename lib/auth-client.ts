// /home/bukhari/work/PageRoastAI/lib/auth-client.ts

import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth client for React components.
 */
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { useSession } = authClient;
