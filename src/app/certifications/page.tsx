import { ArrowUpRight, Award } from "lucide-react";
import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { certifications } from "@/content/certifications";
import { navItem } from "@/content/site";

export const metadata: Metadata = {
  title: "Certifications",
  description: navItem("/certifications").blurb,
};

const labelClass =
  "text-text-subtle font-mono text-xs tracking-widest uppercase";

// A plain, detailed entry per certificate. The playful version (the card
// fan) is on the home page.
export default function CertificationsPage() {
  return (
    <PageShell href="/certifications">
      <ol className="flex flex-col">
        {certifications.map((item, index) => (
          <li key={item.title} className="border-border border-t py-12">
            <Reveal className="grid gap-8 lg:grid-cols-3 lg:gap-16">
              <div className="flex flex-col gap-4">
                <p className="text-text-subtle font-mono text-sm">
                  {String(index + 1).padStart(2, "0")} · {item.date}
                </p>
                <div className="border-border from-bg to-raised relative flex aspect-3/2 flex-col justify-between overflow-hidden rounded-2xl border bg-linear-to-br p-6">
                  <Award
                    aria-hidden
                    className="text-border absolute -right-6 -bottom-6 size-36"
                  />
                  <p className={labelClass}>Certificate</p>
                  <p className="relative font-medium">{item.issuer}</p>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-2">
                <h2 className="text-gradient text-4xl font-semibold tracking-tight xl:text-5xl">
                  {item.title}
                </h2>
                <p className="text-text-muted text-lg">{item.summary}</p>
                <dl className="border-border grid gap-6 border-y py-6 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <dt className={labelClass}>Issued by</dt>
                    <dd>{item.issuer}</dd>
                  </div>
                  <div className="flex flex-col gap-2">
                    <dt className={labelClass}>Date</dt>
                    <dd>{item.date}</dd>
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-3">
                    <dt className={labelClass}>What it covered</dt>
                    <dd className="text-text-muted">{item.details}</dd>
                  </div>
                </dl>
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-accent text-on-accent inline-flex items-center gap-2 self-start rounded-full px-4 py-2 font-mono text-sm"
                  >
                    View credential
                    <ArrowUpRight aria-hidden className="size-4" />
                  </a>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
