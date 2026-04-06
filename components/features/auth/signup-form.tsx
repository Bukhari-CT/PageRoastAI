"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useSignup } from "@/hooks/useAuth";

interface SignupFormProps {
  onSignup?: (user: User) => void;
}

export function SignupForm({ onSignup }: SignupFormProps) {
  const router = useRouter();
  const { signup, loading, error, success } = useSignup();
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signup(form);
    
    if (result.success && onSignup) {
      onSignup({ email: form.email, name: `${form.firstName} ${form.lastName}` } as User);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-green-500">Check your email</CardTitle>
            <CardDescription>We've sent a verification link to {form.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Please click the link in your email to verify your account and continue.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 text-foreground font-bold text-xl hover:opacity-80 transition-opacity"
      >
        🔥 PageRoast
      </Button>

      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start roasting pages in 60 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Alex"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="bg-zinc-950/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Kim"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="bg-zinc-950/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-zinc-950/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-zinc-950/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="bg-zinc-950/50"
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">
              By signing up you agree to our{" "}
              <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms</a> and{" "}
              <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
            </p>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Free Account →"}
            </Button>
          </form>

          <div className="relative my-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Google
            </Button>
            <Button variant="outline" className="w-full">
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className="text-indigo-400 p-0 h-auto"
            >
              Sign in
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>

  );
}
