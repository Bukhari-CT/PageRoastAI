// /home/bukhari/work/PageRoastAI/app/auth/reset-password/page.tsx

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthAlert } from "@/components/auth/AuthAlert";

/**
 * Reset Password Page - handles the actual password update
 */
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    if (!token) {
        return (
            <AuthCard title="Invalid Token" description="Something went wrong with the reset link.">
                <AuthAlert type="error" message="No reset token found in URL." />
                <div className="mt-8 text-center">
                    <Link
                        href="/auth/forgot-password"
                        className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
                    >
                        Try again
                    </Link>
                </div>
            </AuthCard>
        );
    }

    const onSubmit = async (data: ResetPasswordValues) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const { error } = await authClient.resetPassword({
                token,
                newPassword: data.newPassword,
            });

            if (error) {
                setErrorMessage(error.message || "Something went wrong.");
            } else {
                setSuccess(true);
            }
        } catch (err: unknown) {
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthCard title="Password Updated" description="Your password has been changed successfully.">
                <AuthAlert type="success" message="Success! You can now sign in with your new password." />
                <div className="mt-8 text-center">
                    <Link
                        href="/login"
                        className="flex items-center justify-center w-full h-10 px-4 py-2 font-medium transition-all rounded-md bg-orange-600 text-zinc-100 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    >
                        Back to Login
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Set New Password" description="Enter a strong new password for your account">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PasswordField
                    label="New Password"
                    name="newPassword"
                    placeholder="••••••••"
                    register={register("newPassword")}
                    error={errors.newPassword?.message}
                    hint="8+ chars, uppercase, number, special"
                />
                <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    register={register("confirmPassword")}
                    error={errors.confirmPassword?.message}
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
                             Changing password...
                        </span>
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>
        </AuthCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
                    Loading reset page...
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
