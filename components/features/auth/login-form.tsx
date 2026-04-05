"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, Home, Chrome, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { loginAction } from "@/app/actions/auth-actions";
import type { User } from "@/types";

interface LoginFormProps {
  onLogin?: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleLoginSuccess(user: User) {
    if (onLogin) onLogin(user);
    // Simple demo persistence
    localStorage.setItem("pageroast_user", JSON.stringify(user));
    router.push("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const { data, error: actionError } = await loginAction(form);
    
    setIsPending(false);
    if (actionError) {
      setError(actionError);
      return;
    }

    if (data) {
      handleLoginSuccess(data as User);
    }
  }

  function setDemoUser(role: "user" | "admin" | "guest") {
    if (role === "guest") {
      router.push("/");
    } else if (role === "admin") {
      handleLoginSuccess({ name: "Admin", email: "admin@pageroast.com", role: "admin", plan: "agency" });
    } else {
      handleLoginSuccess({ name: "Alex Kim", email: "alex@example.com", role: "user", plan: "free", auditsUsed: 2 });
    }
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue roasting.</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Account Login</CardTitle>
            <CardDescription>Enter your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-background/50"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <a href="#" className="text-[10px] uppercase font-bold text-indigo-500 hover:text-indigo-400">Forgot?</a>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-background/50 pr-10"
                    required
                    disabled={isPending}
                  />
                  <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 group transition-all"
                disabled={isPending}
              >
                {isPending ? "Authenticating..." : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-8 text-center text-[10px] font-bold uppercase tracking-widest after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-3 text-muted-foreground">or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-wider h-10 border-border hover:bg-secondary">
                <Chrome className="h-3.5 w-3.5 text-red-500" />
                Google
              </Button>
              <Button variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-wider h-10 border-border hover:bg-secondary">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm pt-2">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/signup")}
                className="text-indigo-500 dark:text-indigo-400 p-0 h-auto font-bold"
              >
                Sign up free
              </Button>
            </p>
          </CardFooter>
        </Card>

        {/* Demo Section */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mr-2">Demo:</span>
            {(["user", "admin", "guest"] as const).map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                onClick={() => setDemoUser(role)}
                className="capitalize h-7 px-3 text-[10px] font-bold tracking-wider border-border hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
              >
                {role === "admin" && <ShieldCheck className="h-3 w-3 mr-1 text-amber-500" />}
                {role}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
