// /home/bukhari/work/PageRoastAI/middleware.ts

import { betterFetch } from "@better-fetch/fetch";
import { type AuthSession } from "@/types/auth";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/scan", "/results", "/settings", "/billing"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_REDIRECT = "/login";
const AFTER_LOGIN_REDIRECT = "/dashboard";

/**
 * Route protection middleware for PageRoastAI.
 * Manages access control for public, protected, and administrative routes.
 */
export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for Better Auth API routes
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Attempt to fetch session from the auth server
    let sessionResponse;
    try {
        sessionResponse = await betterFetch<AuthSession>("/api/auth/get-session", {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });
    } catch (e) {
        // Log error and treat as unauthenticated
        console.error("[Middleware] Session fetch failed", e);
    }

    const session = sessionResponse?.data;
    const isAuthenticated = !!session;

    // Access control logic
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && pathname !== "/admin/login";

    // 1. Unauthenticated trying to access protected or admin route
    if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
        const callbackUrl = encodeURIComponent(pathname + request.nextUrl.search);
        return NextResponse.redirect(new URL(`${AUTH_REDIRECT}?callbackUrl=${callbackUrl}`, request.url));
    }

    // 2. Authenticated trying to access auth pages (login/signup) or landing page
    const AUTH_PAGES = ["/", "/login", "/signup"];
    if (isAuthenticated && (AUTH_PAGES.includes(pathname) || pathname.startsWith("/auth"))) {
        return NextResponse.redirect(new URL(AFTER_LOGIN_REDIRECT, request.url));
    }

    // 3. Authenticated non-admin trying to access admin route
    if (isAuthenticated && isAdminRoute && !session.user.isAdmin) {
        return NextResponse.redirect(new URL(`${AFTER_LOGIN_REDIRECT}?error=unauthorized`, request.url));
    }

    // 4. Default Allow
    return NextResponse.next();
}

/**
 * Config matcher to exclude static assets from middleware processing.
 */
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
