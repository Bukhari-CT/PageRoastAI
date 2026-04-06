// /home/bukhari/work/PageRoastAI/app/auth/forgot-password/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { AuthAlert } from "@/components/auth/AuthAlert";

/**
 * Forgot Password Page - handles password reset requests
 */
export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const { error } = await authClient.requestPasswordReset({
                email: data.email,
                redirectTo: "/auth/reset-password",
            });

            if (error) {
                // We show success anyway to prevent email enumeration, but log the error
                setErrorMessage(error.message || "Something went wrong.");
            }

            // Always show success to user
            setSubmitted(true);
        } catch (err: unknown) {
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <AuthCard title="Check Your Email" description="Reset link sent if account exists.">
                <AuthAlert
                    type="success"
                    message="If an account with that email exists, you'll receive a reset link shortly."
                />
                <div className="mt-8 text-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Reset Password" description="Enter your email to receive a password reset link">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    register={register("email")}
                    error={errors.email?.message}
                />

                <AuthAlert type="error" message={errorMessage} />

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full h-10 mt-6 px-4 py-2 font-medium transition-all rounded-md bg-orange-600 text-zinc-100 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                             <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Sending Link...
                        </span>
                    ) : (
                        "Send Reset Link"
                    )}
                </button>
            </form>

            <div className="mt-8 text-sm text-center text-zinc-400">
                Wait, I remember my password!{" "}
                <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400 transition-colors underline-offset-4 hover:underline">
                    Sign in
                </Link>
            </div>
        </AuthCard>
    );
}
