// /home/bukhari/work/PageRoastAI/app/auth/forgot-password/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
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
                setErrorMessage(error.message || "Something went wrong.");
            }
            setSubmitted(true);
        } catch {
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />
          
                <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle className="text-2xl text-green-500">Check your email</CardTitle>
                        <CardDescription>Reset link sent if account exists.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            If an account with that email exists, you&apos;ll receive a reset link shortly.
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your email to receive a password reset link.</p>
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
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    {...register("email")}
                                    className={`bg-background/50 ${errors.email ? "border-destructive" : ""}`}
                                    required
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="text-destructive text-xs">{errors.email.message}</p>
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
                                        Sending Link...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Send Reset Link
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center text-sm pb-6">
                        <span className="text-muted-foreground">
                            Wait, I remember my password!{" "}
                            <Link href="/login" className="text-indigo-500 font-bold hover:text-indigo-400">
                                Sign in
                            </Link>
                        </span>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
