export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-surface/70 hover:border-border-strong flex h-full flex-col gap-3 rounded-2xl border p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {children}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border text-text-muted rounded-full border px-3 py-1 font-mono text-xs">
      {children}
    </span>
  );
}
