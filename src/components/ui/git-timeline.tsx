"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export type Commit = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  summary: string;
  /** Shown as added lines when the commit is expanded. */
  details?: string[];
};

/** A stable 7-character "commit hash" derived from the entry's id (FNV-1a). */
function shortHash(text: string) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

const chipClass = "border-border rounded-full border px-2 py-0.5";

/**
 * A timeline drawn like a git commit graph. Each entry is a commit on a short
 * branch that leaves the main line and merges back. The main line draws
 * itself as the page scrolls, and commits slide in when the line reaches them.
 *
 * Client component because GSAP's ScrollTrigger needs the DOM. With
 * `expandable`, each commit has a button that shows its details.
 */
export function GitTimeline({
  branch,
  commits,
  expandable = false,
  heading: Heading = "h3",
}: {
  branch: string;
  commits: Commit[];
  expandable?: boolean;
  heading?: "h2" | "h3";
}) {
  const root = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(
    expandable ? (commits[0]?.id ?? null) : null,
  );

  useGSAP(
    () => {
      // matchMedia: the animations exist only for visitors who have not asked
      // for reduced motion. Everyone else gets the finished timeline.
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              end: "bottom 60%",
              scrub: 0.5, // tie progress to scroll, with half a second of easing
            },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-commit]").forEach((commit) => {
          const trigger = { trigger: commit, start: "top 85%" };
          gsap.from(commit.querySelector("[data-body]"), {
            opacity: 0,
            x: 24,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: trigger,
          });
          gsap.from(commit.querySelectorAll("[data-node], [data-branch]"), {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "back.out(2)",
            scrollTrigger: trigger,
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <span
        aria-hidden
        className="bg-border absolute top-0 bottom-0 left-2 w-px"
      />
      <span
        aria-hidden
        data-line
        className="bg-accent absolute top-0 bottom-0 left-2 w-px origin-top"
      />
      <ol>
        {commits.map((commit, index) => {
          const open = openId === commit.id;
          const detailsId = `${commit.id}-details`;
          return (
            <li key={commit.id} data-commit className="relative pb-10 pl-14">
              {/* The branch: leaves the main line, runs beside it, merges back. */}
              <span
                aria-hidden
                data-branch
                className="border-border-strong absolute top-2 bottom-6 left-2 w-6 origin-left rounded-r-2xl border-y border-r"
              />
              <span
                aria-hidden
                data-node
                className="bg-accent ring-bg absolute top-8 left-8 -ml-1.5 size-3 rounded-full ring-4"
              />
              <div data-body className="flex flex-col gap-2">
                <p className="text-text-subtle flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span>commit {shortHash(commit.id)}</span>
                  {index === 0 && <span className={chipClass}>HEAD</span>}
                  <span className={chipClass}>{branch}</span>
                  <span>{commit.period}</span>
                </p>
                <Heading className="text-lg font-medium">
                  {commit.title}
                </Heading>
                <p className="text-text-muted text-sm">{commit.subtitle}</p>
                <p className="text-text-muted">{commit.summary}</p>
                {expandable && commit.details && commit.details.length > 0 && (
                  <>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={detailsId}
                      onClick={() => setOpenId(open ? null : commit.id)}
                      className="hover:text-text text-text-muted self-start font-mono text-sm underline underline-offset-4"
                    >
                      {open ? "hide changes" : "show changes"}
                    </button>
                    <ul
                      id={detailsId}
                      hidden={!open}
                      className="border-border bg-surface/70 flex flex-col gap-1 rounded-xl border p-4 font-mono text-sm backdrop-blur-sm"
                    >
                      {commit.details.map((detail) => (
                        <li key={detail} className="flex gap-3">
                          <span aria-hidden className="text-text-subtle">
                            +
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
