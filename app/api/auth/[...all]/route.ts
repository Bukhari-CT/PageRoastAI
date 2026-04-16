// /home/bukhari/work/PageRoastAI/app/api/auth/[...all]/route.ts

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Handle all authentication-related API requests using Better Auth's Next.js handler.
 */
export const { GET, POST } = toNextJsHandler(auth);
