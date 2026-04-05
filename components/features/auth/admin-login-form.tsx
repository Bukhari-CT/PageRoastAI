"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { User } from "@/types";

export function AdminLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const { adminLoginAction } = await import("@/app/actions/auth-actions");
    const { data, error: actionError } = await adminLoginAction(form);
    
    setIsPending(false);
    if (actionError) {
      setError(actionError);
      return;
    }

    if (data) {
      localStorage.setItem("pageroast_user", JSON.stringify(data));
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Admin-specific decorative background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] -z-10 rounded-full" />

      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 gap-2 text-muted-foreground hover:text-foreground font-bold text-lg"
      >
        🔥 PageRoast
      </Button>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 mb-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground">Authorized personnel only.</p>
        </div>

        <Card className="border-border bg-card/30 backdrop-blur-md shadow-2xl border-amber-500/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Secure Login
            </CardTitle>
            <CardDescription>Enter your administrative credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pageroast.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-background/50 border-border/50 focus:border-amber-500/50 transition-colors"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secure Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-background/50 pr-10 border-border/50 focus:border-amber-500/50 transition-colors"
                    required
                    disabled={isPending}
                  />
                  <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white h-11 group transition-all"
                disabled={isPending}
              >
                {isPending ? "Verifying..." : (
                  <span className="flex items-center gap-2">
                    Access Terminal
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push("/login")}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to regular login
          </Button>
        </div>
      </div>
    </div>
  );
}
