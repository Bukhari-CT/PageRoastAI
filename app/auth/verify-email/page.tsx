"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAlert } from "@/components/auth/AuthAlert";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [verifying, setVerifying] = useState(!!token);
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">(token ? "idle" : "idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            handleVerify(token);
        }
    }, [token]);

    const handleVerify = async (vToken: string) => {
        setVerifying(true);
        setStatus("idle");
        setErrorMessage(null);

        try {
            const { error } = await authClient.verifyEmail({ query: { token: vToken } });
            if (error) {
                setStatus("error");
                setErrorMessage(error.message || "Invalid or expired verification link.");
            } else {
                setStatus("success");
            }
        } catch (err: unknown) {
            setStatus("error");
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail) return;

        setResending(true);
        setErrorMessage(null);

        try {
            const { error } = await authClient.sendVerificationEmail({ email: resendEmail });
            if (error) {
                setErrorMessage(error.message || "Something went wrong.");
            } else {
                setStatus("idle"); // reset state to show generic message
                alert("Verification link resent! Please check your inbox.");
            }
        } catch (err: unknown) {
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setResending(false);
        }
    };

    if (verifying) {
        return (
            <AuthCard title="Verifying" description="Just a moment while we verify your email.">
                <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-zinc-400">Please wait deeply while we roast your audit request...</p>
                </div>
            </AuthCard>
        );
    }

    if (status === "success") {
        return (
            <AuthCard title="Email Verified" description="Success! Your email has been verified.">
                <AuthAlert type="success" message="Your email is now verified! You can now sign in to your account." />
                <div className="mt-8">
                    <Link
                        href="/login"
                        className="flex items-center justify-center w-full h-10 px-4 py-2 font-medium transition-all rounded-md bg-orange-600 text-zinc-100 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        Sign in
                    </Link>
                </div>
            </AuthCard>
        );
    }

    if (status === "error" || !token) {
        return (
            <AuthCard
                title={status === "error" ? "Invalid Link" : "Check Your Email"}
                description="Verify your email to activate all features of PageRoastAI"
            >
                {status === "error" && (
                    <div className="mb-6">
                        <AuthAlert type="error" message={errorMessage || "Verification link is invalid."} />
                    </div>
                )}

                <p className="text-sm text-zinc-400 mb-6 text-center">
                    Enter your email to resend the verification link if you didn't receive it.
                </p>

                <form onSubmit={handleResend} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            className="flex w-full h-10 px-3 py-2 text-sm transition-colors border rounded-md bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={resending}
                        className="flex items-center justify-center w-full h-10 mt-2 px-4 py-2 font-medium transition-all rounded-md bg-orange-600 text-zinc-100 hover:bg-orange-500 focus:outline-none disabled:opacity-50"
                    >
                        {resending ? "Sending..." : "Resend verification link"}
                    </button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                            Back to login
                        </Link>
                    </div>
                </form>
            </AuthCard>
        );
    }

    return null;
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
                    Loading verification page...
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
