import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { navItem } from "@/content/site";

/** A home page block that previews one nav section and links to its full page. */
export function SummarySection({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { label, blurb } = navItem(href);
  const headingId = `${href.slice(1)}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <Reveal className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2
              id={headingId}
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {label}
            </h2>
            <p className="text-text-muted">{blurb}</p>
          </div>
          <Link
            href={href}
            className="group border-border-strong hover:bg-accent hover:text-on-accent inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm transition-colors"
          >
            View all
            <span className="sr-only">{label}</span>
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>
        {children}
      </Reveal>
    </section>
  );
}
