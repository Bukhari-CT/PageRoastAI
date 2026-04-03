"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppView, User, UserRole } from "@/types";

interface LoginFormProps {
  onNavigate: (view: AppView) => void;
  onLogin?: (user: User) => void;
}

export function LoginForm({ onNavigate, onLogin }: LoginFormProps) {
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
      onNavigate("landing");
    } else if (role === "admin") {
      handleLoginSuccess({ name: "Admin", email: "admin@pageroast.com", role: "admin", plan: "agency" });
    } else {
      handleLoginSuccess({ name: "Alex Kim", email: "alex@example.com", role: "user", plan: "free", auditsUsed: 2 });
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6">
      <button
        onClick={() => onNavigate("landing")}
        className="absolute top-8 left-8 text-[var(--text-primary)] font-bold text-xl hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
      >
        🔥 PageRoast
      </button>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-[var(--text-primary)] font-bold text-2xl mb-1">Welcome back</h2>
        <p className="text-[var(--text-muted)] text-sm mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="text-[var(--text-muted)] text-sm mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[var(--text-muted)] text-sm block">Password</label>
              <a href="#" className="text-indigo-400 text-xs hover:text-indigo-300">Forgot password?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer border-none"
          >
            Sign In →
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--bg-surface)] text-zinc-600">or continue with</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <button className="w-full border border-[var(--border-color)] rounded-lg py-2.5 text-[var(--text-muted)] text-sm hover:bg-zinc-900/50 transition-colors cursor-pointer bg-transparent">
            Continue with Google
          </button>
          <button className="w-full border border-[var(--border-color)] rounded-lg py-2.5 text-[var(--text-muted)] text-sm hover:bg-zinc-900/50 transition-colors cursor-pointer bg-transparent">
            Continue with GitHub
          </button>
        </div>

        <p className="text-zinc-500 text-sm text-center">
          Don&apos;t have an account?{" "}
          <button onClick={() => onNavigate("signup")} className="text-indigo-400 hover:text-indigo-300 cursor-pointer bg-transparent border-none">
            Sign up free
          </button>
        </p>
      </div>

      {/* Demo shortcuts */}
      <div className="mt-8 flex gap-2 justify-center text-xs">
        <span className="text-zinc-500">Demo logins:</span>
        {(["user", "admin", "guest"] as const).map((role) => (
          <button
            key={role}
            onClick={() => setDemoUser(role)}
            className="border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-zinc-600 transition-colors cursor-pointer bg-transparent capitalize"
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}
