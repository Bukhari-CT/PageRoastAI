"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onLogin?: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  function handleLoginSuccess(user: User) {
    if (onLogin) onLogin(user);
    router.push("/dashboard");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLoginSuccess({
      name: "Alex Kim",
      email: form.email || "alex@example.com",
      role: "user",
      plan: "free",
      auditsUsed: 2,
    });
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-zinc-950/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-indigo-400 text-xs hover:text-indigo-300">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-zinc-950/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Sign In →
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
        <CardFooter className="flex flex-col space-y-4 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button
              variant="link"
              onClick={() => router.push("/signup")}
              className="text-indigo-400 p-0 h-auto"
            >
              Sign up free
            </Button>
          </p>
        </CardFooter>
      </Card>

      {/* Demo shortcuts */}
      <div className="mt-8 flex gap-2 justify-center items-center text-xs">
        <span className="text-muted-foreground">Demo logins:</span>
        {(["user", "admin", "guest"] as const).map((role) => (
          <Button
            key={role}
            variant="outline"
            size="sm"
            onClick={() => setDemoUser(role)}
            className="capitalize h-7 px-2"
          >
            {role}
          </Button>
        ))}
      </div>
    </div>
  );
}
