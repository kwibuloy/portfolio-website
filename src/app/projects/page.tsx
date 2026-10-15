import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { Tag } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/content/projects";
import { navItem } from "@/content/site";

export const metadata: Metadata = {
  title: "Projects",
  description: navItem("/projects").blurb,
};

const labelClass =
  "text-text-subtle font-mono text-xs tracking-widest uppercase";

// A plain, detailed case study per project. The playful version (draggable
// windows) is on the home page.
export default function ProjectsPage() {
  return (
    <PageShell href="/projects">
      <nav aria-label="Projects on this page">
        <ul className="flex flex-wrap gap-3">
          {projects.map((project, index) => (
            <li key={project.slug}>
              <a
                href={`#${project.slug}`}
                className="border-border-strong hover:bg-accent hover:text-on-accent inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm transition-colors"
              >
                <span className="opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {project.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {projects.map((project, index) => (
        <article
          key={project.slug}
          id={project.slug}
          aria-labelledby={`${project.slug}-title`}
          className="border-border scroll-mt-24 border-t pt-12"
        >
          <Reveal className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Placeholder for a screenshot. Swap for next/image once one exists. */}
            <div
              aria-hidden
              className={`border-border from-raised to-glow-deep aspect-video rounded-2xl border bg-linear-to-br ${
                index % 2 === 1 ? "lg:order-last" : ""
              }`}
            />

            <div className="flex flex-col gap-6">
              <p className="text-text-subtle font-mono text-sm">
                {String(index + 1).padStart(2, "0")} · {project.year} ·{" "}
                {project.kind}
              </p>
              <h2
                id={`${project.slug}-title`}
                className="text-gradient text-4xl font-semibold tracking-tight xl:text-6xl"
              >
                {project.title}
              </h2>
              <p className="text-text-muted text-lg">{project.description}</p>

              <dl className="border-border grid gap-6 border-y py-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <dt className={labelClass}>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div className="flex flex-col gap-2">
                  <dt className={labelClass}>Built with</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li key={tag}>
                          <Tag>{tag}</Tag>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3">
                <h3 className={labelClass}>Highlights</h3>
                <ul className="text-text-muted flex list-disc flex-col gap-2 pl-5">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>

              {project.links.length > 0 && (
                <ul className="flex flex-wrap gap-3">
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-accent text-on-accent inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-sm"
                      >
                        {link.label}
                        <ArrowUpRight aria-hidden className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </article>
      ))}
    </PageShell>
  );
}
