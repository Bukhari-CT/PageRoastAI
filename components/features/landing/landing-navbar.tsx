import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LANDING_NAV_LINKS } from "@/constants";

export function LandingNavbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[var(--border-color)]"
      style={{ background: "rgba(10,10,10,0.8)" }}
    >
      <div className="max-w-[80rem] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[var(--text-primary)] hover:opacity-80 transition-opacity">
          <span>🔥</span>
          <span>PageRoast</span>
        </Link>

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
          <Link
            href="/login"
            className="border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer block"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-[var(--pr-accent)] hover:bg-[var(--pr-accent-hover)] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-none block"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
