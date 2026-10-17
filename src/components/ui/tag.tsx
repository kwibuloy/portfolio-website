export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border text-text-muted rounded-full border px-3 py-1 font-mono text-xs">
      {children}
    </span>
  );
}
