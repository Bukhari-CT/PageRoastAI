"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useSignup } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth-client";

interface SignupFormProps {
  onSignup?: (user: User) => void;
  /** Google sign-up is hidden unless the server has OAuth credentials. */
  googleEnabled?: boolean;
}

export function SignupForm({ onSignup, googleEnabled = false }: SignupFormProps) {
  const router = useRouter();
  const { signup, loading, error, fieldErrors, success } = useSignup();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signup(form);

    if (result.success && onSignup) {
      onSignup({
        email: form.email,
        name: `${form.firstName} ${form.lastName}`,
        firstName: form.firstName,
        lastName: form.lastName,
        role: "user",
        plan: "free"
      } as User);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl text-green-500">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent a verification link to {form.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Please click the link in your email to verify your account and continue.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative background elements */}
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="text-muted-foreground">Start roasting pages in 60 seconds.</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign Up</CardTitle>
            <CardDescription>Create a free account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Alex"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={`bg-background/50 ${fieldErrors.firstName ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.firstName && (
                    <p className="text-destructive text-xs">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Kim"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={`bg-background/50 ${fieldErrors.lastName ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.lastName && (
                    <p className="text-destructive text-xs">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`bg-background/50 ${fieldErrors.email ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-destructive text-xs">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`bg-background/50 ${fieldErrors.password ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.password && (
                  <p className="text-destructive text-xs">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={`bg-background/50 ${fieldErrors.confirmPassword ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-destructive text-xs">{fieldErrors.confirmPassword}</p>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                By signing up you agree to our{" "}
                <a href="/privacy" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 dark:hover:text-indigo-300">Privacy Policy</a>
              </p>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Free Account →"}
              </Button>
            </form>

            {googleEnabled && (
              <>
                <div className="relative my-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">or continue with</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => authClient.signIn.social({ provider: "google" })}
                    disabled={loading}
                  >
                    Continue with Google
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p className="text-muted-foreground w-full">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/login")}
                className="text-indigo-500 dark:text-indigo-400 p-0 h-auto"
              >
                Sign in
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
