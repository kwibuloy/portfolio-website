import { Reveal } from "@/components/ui/reveal";
import { navItem } from "@/content/site";

/** Shared frame for the full-detail pages: heading from the nav data, then content. */
export function PageShell({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { label, blurb } = navItem(href);
  return (
    <main className="max-w-content mx-auto flex w-full flex-col gap-12 px-6 py-12 lg:px-12 lg:py-20">
      <Reveal immediate>
        <header className="flex flex-col gap-4">
          <h1 className="text-gradient text-4xl font-semibold tracking-tight sm:text-6xl">
            {label}
          </h1>
          <p className="text-text-muted text-lg">{blurb}</p>
        </header>
      </Reveal>
      {children}
    </main>
  );
}
