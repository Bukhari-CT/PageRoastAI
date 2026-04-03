"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppView, User } from "@/types";

interface SignupFormProps {
  onNavigate: (view: AppView) => void;
  onSignup?: (user: User) => void;
}

export function SignupForm({ onNavigate, onSignup }: SignupFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleSignupSuccess(user: User) {
    if (onSignup) onSignup(user);
    router.push("/dashboard");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSignupSuccess({
      name: form.name || "Alex Kim",
      email: form.email || "alex@example.com",
      role: "user",
      plan: "free",
      auditsUsed: 0,
    });
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
        <h2 className="text-[var(--text-primary)] font-bold text-2xl mb-1">Create your account</h2>
        <p className="text-[var(--text-muted)] text-sm mb-8">Start roasting pages in 60 seconds</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="text-[var(--text-muted)] text-sm mb-1 block">Full Name</label>
            <input
              type="text"
              placeholder="Alex Kim"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
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
            <label className="text-[var(--text-muted)] text-sm mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <p className="text-zinc-500 text-xs">
            By signing up you agree to our{" "}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms</a>{" "}and{" "}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
          </p>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer border-none"
          >
            Create Free Account →
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
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="text-indigo-400 hover:text-indigo-300 cursor-pointer bg-transparent border-none">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
