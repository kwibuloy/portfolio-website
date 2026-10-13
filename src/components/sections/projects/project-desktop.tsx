"use client";

import { Folder, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Tag } from "@/components/ui/card";
import { type Project, projects } from "@/content/projects";

function ProjectBody({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Placeholder for a screenshot. Swap for next/image once one exists. */}
      <div
        aria-hidden
        className="from-raised to-glow-deep aspect-video rounded-lg bg-linear-to-br"
      />
      <p className="text-text-subtle font-mono text-xs">
        {project.year} · {project.kind}
      </p>
      <p className="text-text-muted">{project.summary}</p>
      <ul className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li key={tag}>
            <Tag>{tag}</Tag>
          </li>
        ))}
      </ul>
      {project.links.length > 0 && (
        <ul className="flex flex-wrap gap-4">
          {project.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm underline underline-offset-4"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Projects as app windows on a desktop. Icons and the taskbar open a window; windows can
 * be dragged, brought to the front, and closed. Below the sm breakpoint there
 * is no room to drag, so the same projects become a swipeable row of cards.
 */
export function ProjectDesktop() {
  const desktop = useRef<HTMLDivElement>(null);
  // `stack` lists the open windows from back to front.
  const [stack, setStack] = useState(() =>
    projects.slice(0, 3).map((project) => project.slug),
  );

  const raise = (slug: string) =>
    setStack((current) =>
      current.at(-1) === slug
        ? current
        : [...current.filter((open) => open !== slug), slug],
    );
  const close = (slug: string) =>
    setStack((current) => current.filter((open) => open !== slug));

  return (
    <>
      <div
        ref={desktop}
        className="border-border bg-surface/60 relative hidden h-200 overflow-hidden rounded-2xl border backdrop-blur-sm sm:block"
      >
        <div className="border-border text-text-subtle flex items-center justify-between border-b px-4 py-2 font-mono text-xs">
          <span>~/projects</span>
          <span aria-hidden>click an icon to open · drag a window to move</span>
        </div>

        <ul className="absolute top-14 left-4 flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.slug}>
              <button
                type="button"
                aria-expanded={stack.includes(project.slug)}
                onClick={() => raise(project.slug)}
                className="hover:bg-raised flex w-28 flex-col items-center gap-2 rounded-lg p-3 text-center font-mono text-sm transition-colors"
              >
                <Folder aria-hidden className="size-12" />
                {project.title}
              </button>
            </li>
          ))}
        </ul>

        {/* Windows render in a fixed order and only their z-index changes, so
            raising one never moves a DOM node mid-drag. */}
        <AnimatePresence>
          {projects.map((project, index) =>
            stack.includes(project.slug) ? (
              <motion.section
                key={project.slug}
                aria-label={project.title}
                drag
                dragConstraints={desktop}
                dragMomentum={false}
                dragElastic={0.1}
                onPointerDown={() => raise(project.slug)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                // Each window starts a step further right and down.
                style={{
                  zIndex: stack.indexOf(project.slug) + 1,
                  left: `calc(var(--spacing) * ${44 + index * 44})`,
                  top: `calc(var(--spacing) * ${16 + index * 20})`,
                }}
                className="border-border-strong bg-bg absolute w-120 cursor-grab rounded-xl border shadow-xl active:cursor-grabbing"
              >
                <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-2">
                  <h3 className="truncate font-mono text-sm font-medium">
                    {project.title}
                  </h3>
                  <button
                    type="button"
                    aria-label={`Close ${project.title}`}
                    onClick={() => close(project.slug)}
                    className="text-text-muted hover:bg-raised hover:text-text flex size-7 shrink-0 items-center justify-center rounded-full transition-colors"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </header>
                <ProjectBody project={project} />
              </motion.section>
            ) : null,
          )}
        </AnimatePresence>

        {/* Taskbar: one button per project. It opens a closed window and
            brings an open one to the front. */}
        <ul className="border-border bg-bg/80 absolute inset-x-0 bottom-0 z-50 flex gap-2 border-t p-2 backdrop-blur-md">
          {projects.map((project) => {
            const open = stack.includes(project.slug);
            return (
              <li key={project.slug}>
                <button
                  type="button"
                  aria-pressed={open}
                  onClick={() => raise(project.slug)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors ${
                    open
                      ? "bg-raised text-text"
                      : "text-text-muted hover:bg-raised"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-2 rounded-full ${open ? "bg-accent" : "bg-border-strong"}`}
                  />
                  {project.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:hidden">
        {projects.map((project) => (
          <li
            key={project.slug}
            className="border-border bg-surface/70 w-5/6 shrink-0 snap-center rounded-2xl border backdrop-blur-sm"
          >
            <h3 className="border-border border-b px-4 py-2 font-mono text-sm font-medium">
              {project.title}
            </h3>
            <ProjectBody project={project} />
          </li>
        ))}
      </ul>
    </>
  );
}
