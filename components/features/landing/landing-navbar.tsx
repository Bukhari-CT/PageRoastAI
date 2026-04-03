"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LANDING_NAV_LINKS } from "@/constants";
import type { AppView } from "@/types";

interface LandingNavbarProps {
  onNavigate: (view: AppView) => void;
}

export function LandingNavbar({ onNavigate }: LandingNavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[var(--border-color)]"
      style={{ background: "rgba(10,10,10,0.8)" }}
    >
      <div className="max-w-[80rem] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg text-[var(--text-primary)]">
          <span>🔥</span>
          <span>PageRoast</span>
        </div>

        <div className="flex gap-8 items-center">
          {LANDING_NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => onNavigate("login")}
            className="border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigate("signup")}
            className="bg-[var(--pr-accent)] hover:bg-[var(--pr-accent-hover)] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-none"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
