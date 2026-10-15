import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { FloatingPortrait } from "@/components/sections/home/floating-portrait";
import { Reveal } from "@/components/ui/reveal";
import { ScrambleText } from "@/components/ui/scramble-text";
import { projects } from "@/content/projects";
import { site, socials } from "@/content/site";

// Projects is counted from the content file, so it stays true as projects are
// added.
const stats = [
  { value: "4.00", label: "GPA", href: "/education" },
  { value: "2×", label: "Top 1 Overall Academic Scholar", href: "/education" },
  {
    value: String(projects.length),
    label: "Projects shipped",
    href: "/projects",
  },
];

export function Hero() {
  return (
    <section className="flex flex-col gap-12">
      <div className="grid items-center gap-8 md:grid-cols-5 md:gap-16">
        <Reveal immediate className="md:col-span-2">
          <FloatingPortrait
            src={site.portrait}
            alt={`Portrait of ${site.name}`}
            handle={site.github}
          />
        </Reveal>

        <div className="flex flex-col gap-6 md:col-span-3">
          <Reveal immediate delay={0.1}>
            <p className="text-text-subtle font-mono text-sm">{site.role}</p>
            <h1 className="text-gradient mt-2 text-4xl font-semibold tracking-tight sm:text-5xl xl:text-7xl">
              <ScrambleText text={site.name} />
            </h1>
            <a
              href={site.resume}
              download
              className="group bg-accent text-on-accent mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-sm transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
            >
              <Download
                aria-hidden
                className="size-4 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none"
              />
              Download résumé
              <span className="opacity-60">PDF</span>
            </a>
          </Reveal>
          <Reveal immediate delay={0.2}>
            <p className="text-text-muted text-lg xl:text-xl">{site.intro}</p>
          </Reveal>
          <Reveal immediate delay={0.3}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    data-tour={`social-${label.toLowerCase()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group text-text-muted hover:text-text inline-flex items-center gap-1 font-mono text-sm transition-colors"
                  >
                    {label}
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <Reveal immediate delay={0.4}>
        <ul className="border-border divide-border grid border-y sm:grid-cols-3 sm:divide-x">
          {stats.map((stat) => (
            <li key={stat.label}>
              <Link
                href={stat.href}
                className="group hover:bg-surface/70 flex flex-col gap-1 px-4 py-6 transition-colors"
              >
                <span className="flex items-start gap-1 text-4xl font-semibold tracking-tight xl:text-5xl">
                  {stat.value}
                  <ArrowUpRight
                    aria-hidden
                    className="text-text-subtle size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  />
                </span>
                <span className="text-text-subtle font-mono text-xs tracking-widest uppercase">
                  {stat.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
