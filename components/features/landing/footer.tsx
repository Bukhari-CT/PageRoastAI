import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] px-6 py-8 bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <p className="text-[var(--text-primary)] font-bold text-lg">🔥 PageRoast AI</p>
          <p className="text-zinc-600 text-xs mt-2">© 2025 PageRoast. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-zinc-500 hover:text-[var(--text-primary)] text-sm transition-colors">Privacy</Link>
          <Link href="#" className="text-zinc-500 hover:text-[var(--text-primary)] text-sm transition-colors">Terms</Link>
          <Link href="#" className="text-zinc-500 hover:text-[var(--text-primary)] text-sm transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
