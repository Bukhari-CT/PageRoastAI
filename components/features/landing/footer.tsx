import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Log In", href: "/login" },
  { label: "Sign Up", href: "/signup" },
];

const LEGAL_LINKS = [{ label: "Privacy Policy", href: "/privacy" }];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12 bg-background">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="sm:col-span-2 md:col-span-2">
          <p className="text-foreground font-bold text-lg">🔥 PageRoast AI</p>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs">
            Brutally honest AI audits for your landing page — with the exact code to fix every issue.
          </p>
        </div>

        <div>
          <p className="text-foreground text-xs font-bold uppercase tracking-widest mb-4">Product</p>
          <ul className="space-y-3">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-foreground text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
          <ul className="space-y-3">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-border/50">
        <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} PageRoast. All rights reserved.</p>
      </div>
    </footer>
  );
}
