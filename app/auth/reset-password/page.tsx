// /home/bukhari/work/PageRoastAI/app/auth/reset-password/page.tsx

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />
          
                <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle className="text-2xl text-destructive">Invalid Link</CardTitle>
                        <CardDescription>Something went wrong with the reset link.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            No reset token found in the URL.
                        </p>
                        <Button onClick={() => router.push("/auth/forgot-password")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
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
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />
          
                <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle className="text-2xl text-green-500">Password Updated</CardTitle>
                        <CardDescription>Your password has been changed successfully.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            Success! You can now sign in with your new password.
                        </p>
                        <Button onClick={() => router.push("/login")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Decorative background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />

            <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="absolute top-8 left-8 gap-2 text-muted-foreground hover:text-foreground font-bold text-lg"
            >
                🔥 PageRoast
            </Button>

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Set New Password</h1>
                    <p className="text-muted-foreground">Enter a strong new password for your account.</p>
                </div>

                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {errorMessage && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                    {errorMessage}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                <div className="relative group">
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        {...register("newPassword")}
                                        className={`bg-background/50 pr-10 ${errors.newPassword ? "border-destructive" : ""}`}
                                        disabled={loading}
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                                </div>
                                {errors.newPassword && (
                                    <p className="text-destructive text-xs">{errors.newPassword.message}</p>
                                )}
                                {!errors.newPassword && (
                                    <p className="text-muted-foreground text-xs">8+ chars, uppercase, number, special</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                                <div className="relative group">
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        {...register("confirmPassword")}
                                        className={`bg-background/50 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                                        disabled={loading}
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                            
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 group transition-all mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Changing Password...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Reset Password
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
