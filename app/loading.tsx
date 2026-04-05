export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--pr-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-muted)] animate-pulse font-medium">Roasting your page...</p>
      </div>
    </div>
  );
}
