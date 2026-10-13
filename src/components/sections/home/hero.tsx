import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { GlitchPortrait } from "@/components/sections/home/glitch-portrait";
import { Reveal } from "@/components/ui/reveal";
import { ScrambleText } from "@/components/ui/scramble-text";
import { certifications } from "@/content/certifications";
import { projects } from "@/content/projects";
import { site, socials } from "@/content/site";
import { stack, tools } from "@/content/technologies";

// Counted from the content files, so they stay true as content is added.
const stats = [
  { label: "Technologies", value: stack.length, href: "/tech-stack" },
  { label: "Tools", value: tools.length, href: "/tech-stack" },
  { label: "Projects", value: projects.length, href: "/projects" },
  {
    label: "Certifications",
    value: certifications.length,
    href: "/certifications",
  },
];

export function Hero() {
  return (
    <section className="flex flex-col gap-12">
      <div className="grid items-center gap-8 md:grid-cols-5 md:gap-16">
        <Reveal className="md:col-span-2">
          <GlitchPortrait
            src={site.portrait}
            alt={`Portrait of ${site.name}`}
          />
        </Reveal>

        <div className="flex flex-col gap-6 md:col-span-3">
          <Reveal delay={0.1}>
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
          <Reveal delay={0.2} className="flex flex-col gap-4">
            {site.intro.map((paragraph) => (
              <p key={paragraph} className="text-text-muted text-lg xl:text-xl">
                {paragraph}
              </p>
            ))}
          </Reveal>
          <Reveal delay={0.3}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
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

      <Reveal delay={0.4}>
        <ul className="border-border divide-border grid grid-cols-2 border-y md:grid-cols-4 md:divide-x">
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
