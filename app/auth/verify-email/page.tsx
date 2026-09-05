"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [verifying, setVerifying] = useState(!!token);
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">(token ? "idle" : "idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resendMessage, setResendMessage] = useState<string | null>(null);

    const handleVerify = useCallback(async (vToken: string) => {
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
        } catch {
            setStatus("error");
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setVerifying(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            handleVerify(token);
        }
    }, [token, handleVerify]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail) return;

        setResending(true);
        setErrorMessage(null);
        setResendMessage(null);

        try {
            const { error } = await authClient.sendVerificationEmail({ email: resendEmail });
            if (error) {
                setErrorMessage(error.message || "Something went wrong.");
            } else {
                setStatus("idle"); // reset state to show generic message
                setResendMessage("Verification link resent! Please check your inbox.");
            }
        } catch {
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setResending(false);
        }
    };

    if (verifying) {
        return (
            <AuthCard title="Verifying" description="Just a moment while we verify your email.">
                <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
                    <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-muted-foreground">Verifying your email address...</p>
                </div>
            </AuthCard>
        );
    }

    if (status === "success") {
        return (
            <AuthCard title="Email Verified" description="Success! Your email has been verified.">
                <AuthAlert type="success" message="Your email is now verified! You can now sign in to your account." />
                <div className="mt-8">
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                        <Link href="/login">Sign in</Link>
                    </Button>
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
                {resendMessage && (
                    <div className="mb-6">
                        <AuthAlert type="success" message={resendMessage} />
                    </div>
                )}

                <p className="text-sm text-muted-foreground mb-6 text-center">
                    Enter your email to resend the verification link if you didn&apos;t receive it.
                </p>

                <form onSubmit={handleResend} className="space-y-4">
                    <Input
                        type="email"
                        required
                        placeholder="john@example.com"
                        aria-label="Email address"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="bg-background/50"
                    />

                    <Button
                        type="submit"
                        disabled={resending}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        {resending ? "Sending..." : "Resend verification link"}
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
                <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
                    Loading verification page...
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
